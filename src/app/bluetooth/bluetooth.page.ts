import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton
} from '@ionic/angular';

import { BleClient } from '@capacitor-community/bluetooth-le';

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
    CommonModule
  ]
})
export class BluetoothPage {

  dispositivos: any[] = [];
  buscando: boolean = false;
  bluetoothActivado: boolean = false;
  mensaje: string = '';

  async iniciarBluetooth() {
    try {
      await BleClient.initialize();

      this.bluetoothActivado = await BleClient.isEnabled();

      if (!this.bluetoothActivado) {
        await BleClient.requestEnable();
        this.bluetoothActivado = await BleClient.isEnabled();
      }

      this.mensaje = this.bluetoothActivado
        ? 'Bluetooth está activado.'
        : 'Bluetooth está desactivado.';

    } catch (error) {
      console.error(error);
      this.mensaje = 'No fue posible inicializar Bluetooth.';
    }
  }

  async buscarDispositivos() {
    try {
      this.dispositivos = [];
      this.buscando = true;
      this.mensaje = 'Buscando dispositivos Bluetooth cercanos...';

      await BleClient.initialize();

      await BleClient.requestLEScan(
        {
          allowDuplicates: false
        },
        (resultado: any) => {

          const dispositivo = resultado.device;

          if (
            dispositivo &&
            !this.dispositivos.some(
              d => d.deviceId === dispositivo.deviceId
            )
          ) {
            this.dispositivos.push(dispositivo);
          }
        }
      );

      setTimeout(async () => {
        await this.detenerBusqueda();
      }, 10000);

    } catch (error) {
      console.error(error);
      this.buscando = false;
      this.mensaje = 'No fue posible realizar la búsqueda Bluetooth.';
    }
  }

  async detenerBusqueda() {
    try {
      await BleClient.stopLEScan();
    } catch (error) {
      console.error(error);
    }

    this.buscando = false;

    if (this.dispositivos.length > 0) {
      this.mensaje = `Se encontraron ${this.dispositivos.length} dispositivo(s).`;
    } else {
      this.mensaje = 'No se encontraron dispositivos BLE.';
    }
  }
}