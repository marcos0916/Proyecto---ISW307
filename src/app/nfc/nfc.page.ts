import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem, IonTextarea, IonButton, IonSpinner, IonBadge
} from '@ionic/angular';
import { CapacitorNfc, NdefRecord, PluginListenerHandle } from '@capgo/capacitor-nfc';
import { StorageService, RegistroCompartido } from '../services/storage';

const ESPERA_TAG_NFC_MS = 15000;

@Component({
  selector: 'app-nfc',
  templateUrl: './nfc.page.html',
  styleUrls: ['./nfc.page.scss'],
  imports: [
    IonItem, IonTextarea, IonButton, IonSpinner, IonBadge,
    CommonModule, FormsModule
  ]
})
export class NfcPage implements OnInit, OnDestroy {
  texto = signal('');
  estado = signal('');
  enviando = signal(false);
  soportado = signal<boolean | null>(null);

  historial = signal<RegistroCompartido[]>([]);

  private listener: PluginListenerHandle | null = null;

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    this.historial.set(await this.storageService.obtenerHistorial());

    try {
      const soporte = await CapacitorNfc.isSupported();
      this.soportado.set(soporte.supported);
    } catch (error) {
      console.error(error);
      this.soportado.set(false);
    }
  }

  async ngOnDestroy() {
    await this.limpiarListener();
    if (this.enviando()) {
      await CapacitorNfc.stopScanning().catch(err => console.error(err));
    }
  }

  async compartir() {
    const texto = this.texto().trim();
    if (!texto) {
      this.estado.set('Escribe un texto para compartir.');
      return;
    }

    this.estado.set('');
    this.enviando.set(true);

    try {
      const soporte = await CapacitorNfc.isSupported();
      this.soportado.set(soporte.supported);

      if (!soporte.supported) {
        this.estado.set('Este dispositivo no tiene NFC. Esta función requiere un dispositivo Android compatible.');
        return;
      }

      const estadoNfc = await CapacitorNfc.getStatus();
      if (estadoNfc.status === 'NO_NFC') {
        this.estado.set('Este dispositivo no tiene NFC.');
        return;
      }
      if (estadoNfc.status === 'NFC_DISABLED') {
        this.estado.set('NFC está desactivado. Actívalo en la configuración del dispositivo.');
        return;
      }

      const compartido = await this.esperarTagYEscribir(texto);

      if (compartido) {
        this.estado.set('Texto compartido correctamente por NFC.');
        await this.storageService.agregarHistorial({
          texto,
          fecha: new Date().toISOString(),
          tipo: 'NFC'
        });
        this.historial.set(await this.storageService.obtenerHistorial());
        this.texto.set('');
      } else {
        this.estado.set('No se detectó ningún tag NFC a tiempo. Acerca un tag o dispositivo e intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      this.estado.set('No fue posible completar la operación NFC.');
    } finally {
      this.enviando.set(false);
      await CapacitorNfc.stopScanning().catch(err => console.error(err));
    }
  }

  cancelar() {
    CapacitorNfc.stopScanning().catch(err => console.error(err));
    this.limpiarListener();
    this.enviando.set(false);
    this.estado.set('Operación cancelada.');
  }

  async limpiarHistorial() {
    await this.storageService.limpiarHistorial();
    this.historial.set([]);
  }

  private esperarTagYEscribir(texto: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resuelto = false;

      const finalizar = async (resultado: boolean) => {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(temporizador);
        await this.limpiarListener();
        resolve(resultado);
      };

      const temporizador = setTimeout(() => finalizar(false), ESPERA_TAG_NFC_MS);

      CapacitorNfc.addListener('nfcEvent', async () => {
        try {
          await CapacitorNfc.write({ records: [this.crearRegistroTexto(texto)] });
          await finalizar(true);
        } catch (error) {
          console.error(error);
          await finalizar(false);
        }
      }).then(listener => {
        this.listener = listener;
      });

      CapacitorNfc.startScanning().catch(async (error) => {
        console.error(error);
        await finalizar(false);
      });
    });
  }

  private async limpiarListener() {
    if (this.listener) {
      await this.listener.remove();
      this.listener = null;
    }
  }

  private crearRegistroTexto(texto: string): NdefRecord {
    const idioma = 'es';
    const idiomaBytes = Array.from(idioma).map(c => c.charCodeAt(0));
    const textoBytes = Array.from(new TextEncoder().encode(texto));
    const statusByte = idiomaBytes.length;

    return {
      tnf: 1,
      type: [0x54],
      id: [],
      payload: [statusByte, ...idiomaBytes, ...textoBytes]
    };
  }
}
