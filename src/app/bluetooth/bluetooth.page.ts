import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonSpinner } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

const DURACION_ESCANEO_MS = 10000;

/**
 * Sección de Bluetooth del módulo "Bluetooth/NFC + Perfil" (mismo estudiante
 * que Configuración). Vive embebida dentro de PerfilPage mediante el segmento
 * Perfil/Bluetooth/NFC — no es una ruta propia, por eso no trae ion-header ni
 * ion-content: ya los pone la página que la aloja.
 */
@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
  imports: [
    IonButton,
    IonSpinner,
    CommonModule
  ]
})
export class BluetoothPage implements OnDestroy {
  // Signals en vez de propiedades planas: esta app corre Angular sin zone.js
  // (ver angular.json, "polyfills": []), así que mutar un campo normal
  // después de un `await` a un plugin nativo no dispara detección de
  // cambios. Confirmado con pruebas en vivo: sin esto, "mensaje" y
  // "dispositivos" nunca se actualizaban en pantalla.
  dispositivos = signal<BleDevice[]>([]);
  buscando = signal(false);
  bluetoothActivado = signal(false);
  mensaje = signal('');

  private timeoutEscaneo: ReturnType<typeof setTimeout> | null = null;

  async iniciarBluetooth() {
    try {
      await BleClient.initialize();

      const activado = await BleClient.isEnabled();
      this.bluetoothActivado.set(activado);

      if (!activado) {
        await BleClient.requestEnable();
        this.bluetoothActivado.set(await BleClient.isEnabled());
      }

      this.mensaje.set(
        this.bluetoothActivado() ? 'Bluetooth está activado.' : 'Bluetooth está desactivado.'
      );

    } catch (error) {
      console.error(error);
      this.mensaje.set('No fue posible inicializar Bluetooth. Verifica que el dispositivo sea compatible.');
    }
  }

  async buscarDispositivos() {
    this.cancelarTimeoutEscaneo();

    try {
      this.dispositivos.set([]);
      this.buscando.set(true);
      this.mensaje.set('Buscando dispositivos Bluetooth cercanos...');

      await BleClient.initialize();

      await BleClient.requestLEScan(
        {
          allowDuplicates: false
        },
        (resultado) => {
          const dispositivo = resultado.device;
          if (!dispositivo) return;

          const yaEsta = this.dispositivos().some(d => d.deviceId === dispositivo.deviceId);
          if (!yaEsta) {
            this.dispositivos.update(lista => [...lista, dispositivo]);
          }
        }
      );

      this.timeoutEscaneo = setTimeout(() => {
        this.detenerBusqueda();
      }, DURACION_ESCANEO_MS);

    } catch (error) {
      console.error(error);
      this.buscando.set(false);
      this.mensaje.set(this.mensajeErrorEscaneo());
    }
  }

  /**
   * `requestLEScan` usa la Web Bluetooth Scanning API, que Chrome solo expone
   * en Android o detrás de un flag experimental de escritorio
   * (chrome://flags/#enable-experimental-web-platform-features). En un
   * navegador de escritorio sin ese flag, el método ni existe (confirmado
   * probando `typeof navigator.bluetooth.requestLEScan` en un Chrome limpio),
   * así que el error no significa que el código falle: en un Android real,
   * Capacitor usa el plugin BLE nativo y no pasa por esta limitación.
   */
  private mensajeErrorEscaneo(): string {
    const esWeb = Capacitor.getPlatform() === 'web';
    const apiNoDisponible = esWeb && typeof (navigator as any).bluetooth?.requestLEScan !== 'function';

    return apiNoDisponible
      ? 'El escaneo Bluetooth no está disponible en este navegador de escritorio: requiere una función experimental de Chrome que solo funciona en Android. Prueba la app instalada en un dispositivo Android real.'
      : 'No fue posible realizar la búsqueda Bluetooth. Activa Bluetooth e intenta de nuevo.';
  }

  async detenerBusqueda() {
    this.cancelarTimeoutEscaneo();

    try {
      await BleClient.stopLEScan();
    } catch (error) {
      console.error(error);
    }

    this.buscando.set(false);

    const total = this.dispositivos().length;
    this.mensaje.set(
      total > 0 ? `Se encontraron ${total} dispositivo(s).` : 'No se encontraron dispositivos BLE.'
    );
  }

  private cancelarTimeoutEscaneo() {
    if (this.timeoutEscaneo) {
      clearTimeout(this.timeoutEscaneo);
      this.timeoutEscaneo = null;
    }
  }

  /** Evita que el escaneo siga corriendo en segundo plano si el usuario sale de la página. */
  ngOnDestroy() {
    this.cancelarTimeoutEscaneo();
    if (this.buscando()) {
      BleClient.stopLEScan().catch(err => console.error(err));
    }
  }
}
