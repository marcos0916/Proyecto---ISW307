import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, RegistroCompartido } from '../services/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CapacitorNfc, NdefRecord, PluginListenerHandle } from '@capgo/capacitor-nfc';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonToggle,
  IonList,
  IonSpinner,
  IonBadge
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';

/** Cuánto esperamos a que el usuario acerque un tag antes de cancelar el envío por NFC. */
const ESPERA_TAG_NFC_MS = 15000;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonToggle,
    IonList,
    IonSpinner,
    IonBadge,
    CommonModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit, OnDestroy {
  // Signals en vez de propiedades planas: esta app corre Angular sin zone.js
  // (ver angular.json, "polyfills": []), así que mutar un campo normal dentro
  // de un callback async (post-await, listener de plugin, etc.) no dispara
  // detección de cambios. Los signals sí lo hacen. Confirmado con pruebas en
  // vivo: sin esto, el perfil guardado no se veía al reabrir la página y el
  // botón de NFC no se deshabilitaba aunque `nfcSoportado` sí cambiaba.

  // --- Perfil ---
  nombre = signal('');
  carrera = signal('');
  correo = signal('');
  foto = signal('');

  // --- Configuraciones (preferencias internas de la app, no controlan hardware directamente) ---
  notificaciones = signal(false);
  bluetoothPref = signal(false);
  nfcPref = signal(false);

  // --- NFC tap-to-share ---
  nfcTexto = signal('');
  nfcEstado = signal('');
  nfcEnviando = signal(false);
  nfcSoportado = signal<boolean | null>(null); // null = todavía no se comprobó

  // --- Historial de compartidos ---
  historial = signal<RegistroCompartido[]>([]);

  private listenerNfc: PluginListenerHandle | null = null;

  constructor(private storageService: StorageService) {
    addIcons({ person });
  }

  async ngOnInit() {
    const perfil = await this.storageService.obtenerPerfil();
    if (perfil) {
      this.nombre.set(perfil.nombre);
      this.carrera.set(perfil.carrera);
      this.correo.set(perfil.correo);
      this.foto.set(perfil.foto || '');
    }

    const configuracion = await this.storageService.obtenerConfiguracion();
    if (configuracion) {
      this.notificaciones.set(configuracion.notificaciones);
      this.bluetoothPref.set(configuracion.bluetooth);
      this.nfcPref.set(configuracion.nfc);
    }

    this.historial.set(await this.storageService.obtenerHistorial());

    try {
      const soporte = await CapacitorNfc.isSupported();
      this.nfcSoportado.set(soporte.supported);
    } catch (error) {
      console.error(error);
      this.nfcSoportado.set(false);
    }
  }

  async ngOnDestroy() {
    await this.limpiarListenerNfc();
    if (this.nfcEnviando()) {
      await CapacitorNfc.stopScanning().catch(err => console.error(err));
    }
  }

  async guardarPerfil() {
    try {
      await this.storageService.guardarPerfil({
        nombre: this.nombre(),
        carrera: this.carrera(),
        correo: this.correo(),
        foto: this.foto()
      });
    } catch (error) {
      console.error(error);
    }
  }

  /** Toma una foto con la cámara o la elige de la galería (el usuario decide con el prompt nativo). */
  async cambiarFoto() {
    try {
      const foto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        quality: 70,
        width: 400
      });

      if (foto.dataUrl) {
        this.foto.set(foto.dataUrl);
        await this.guardarPerfil();
      }
    } catch (error) {
      // El usuario cancelando la selección también cae acá (rejection de Camera.getPhoto); no es un error real.
      console.error(error);
    }
  }

  async cambiarConfiguracion() {
    try {
      await this.storageService.guardarConfiguracion({
        notificaciones: this.notificaciones(),
        bluetooth: this.bluetoothPref(),
        nfc: this.nfcPref()
      });
    } catch (error) {
      console.error(error);
    }
  }

  /** Tap-to-share: escribe el texto como registro NDEF en el próximo tag NFC que se acerque. */
  async compartirPorNfc() {
    const texto = this.nfcTexto().trim();
    if (!texto) {
      this.nfcEstado.set('Escribe un texto para compartir.');
      return;
    }

    this.nfcEstado.set('');
    this.nfcEnviando.set(true);

    try {
      const soporte = await CapacitorNfc.isSupported();
      this.nfcSoportado.set(soporte.supported);

      if (!soporte.supported) {
        this.nfcEstado.set('Este dispositivo no tiene NFC. Esta función requiere un dispositivo Android compatible.');
        return;
      }

      const estado = await CapacitorNfc.getStatus();
      if (estado.status === 'NO_NFC') {
        this.nfcEstado.set('Este dispositivo no tiene NFC.');
        return;
      }
      if (estado.status === 'NFC_DISABLED') {
        this.nfcEstado.set('NFC está desactivado. Actívalo en la configuración del dispositivo.');
        return;
      }

      const compartido = await this.esperarTagYEscribir(texto);

      if (compartido) {
        this.nfcEstado.set('Texto compartido correctamente por NFC.');
        await this.storageService.agregarHistorial({
          texto,
          fecha: new Date().toISOString(),
          tipo: 'NFC'
        });
        this.historial.set(await this.storageService.obtenerHistorial());
        this.nfcTexto.set('');
      } else {
        this.nfcEstado.set('No se detectó ningún tag NFC a tiempo. Acerca un tag o dispositivo e intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      this.nfcEstado.set('No fue posible completar la operación NFC.');
    } finally {
      this.nfcEnviando.set(false);
      await CapacitorNfc.stopScanning().catch(err => console.error(err));
    }
  }

  cancelarNfc() {
    CapacitorNfc.stopScanning().catch(err => console.error(err));
    this.limpiarListenerNfc();
    this.nfcEnviando.set(false);
    this.nfcEstado.set('Operación cancelada.');
  }

  async limpiarHistorial() {
    await this.storageService.limpiarHistorial();
    this.historial.set([]);
  }

  /**
   * Inicia el escaneo NFC y espera a que se detecte un tag para escribirle el
   * texto. Se resuelve `true` si la escritura fue real y exitosa, `false` si
   * no se detectó ningún tag dentro del tiempo límite.
   */
  private esperarTagYEscribir(texto: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resuelto = false;

      const finalizar = async (resultado: boolean) => {
        if (resuelto) return;
        resuelto = true;
        clearTimeout(temporizador);
        await this.limpiarListenerNfc();
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
        this.listenerNfc = listener;
      });

      CapacitorNfc.startScanning().catch(async (error) => {
        console.error(error);
        await finalizar(false);
      });
    });
  }

  private async limpiarListenerNfc() {
    if (this.listenerNfc) {
      await this.listenerNfc.remove();
      this.listenerNfc = null;
    }
  }

  /** Arma un registro NDEF de texto (RTD_TEXT) según la especificación del NFC Forum. */
  private crearRegistroTexto(texto: string): NdefRecord {
    const idioma = 'es';
    const idiomaBytes = Array.from(idioma).map(c => c.charCodeAt(0));
    const textoBytes = Array.from(new TextEncoder().encode(texto));
    const statusByte = idiomaBytes.length; // bit7=0 (UTF-8), bits0-5 = longitud del código de idioma

    return {
      tnf: 1, // TNF_WELL_KNOWN
      type: [0x54], // 'T'
      id: [],
      payload: [statusByte, ...idiomaBytes, ...textoBytes]
    };
  }
}
