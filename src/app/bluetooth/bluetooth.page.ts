import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner
} from '@ionic/angular';

import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

const DURACION_ESCANEO_MS = 10000;

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.page.html',
  styleUrls: ['./bluetooth.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    CommonModule
  ]
})
export class BluetoothPage implements OnDestroy {
  // Signals en vez de propiedades planas: esta app corre Angular sin zone.js
  // (ver angular.json, "polyfills": []). Las actualizaciones de estado acá
  // pasan casi todas DESPUÉS de un `await` a un plugin nativo, así que sin
  // signals la pantalla nunca se enteraría de que `mensaje` o `dispositivos`
  // cambiaron.
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
      this.mensaje.set('No fue posible realizar la búsqueda Bluetooth. Activa Bluetooth e intenta de nuevo.');
    }
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
