import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonToggle
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { BluetoothPage } from '../bluetooth/bluetooth.page';
import { NfcPage } from '../nfc/nfc.page';

type VistaConfiguracion = 'perfil' | 'bluetooth' | 'nfc';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonToggle,
    BluetoothPage,
    NfcPage,
    CommonModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit {
  nombre = signal('');
  carrera = signal('');
  correo = signal('');
  foto = signal('');

  notificaciones = signal(false);
  bluetoothPref = signal(false);
  nfcPref = signal(false);

  vista = signal<VistaConfiguracion>('perfil');

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
  }

  cambiarVista(event: CustomEvent) {
    this.vista.set(event.detail.value as VistaConfiguracion);
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

  async cambiarFoto() {
    try {
      const foto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: Capacitor.getPlatform() === 'web' ? CameraSource.Photos : CameraSource.Prompt,
        quality: 70,
        width: 400
      });

      if (foto.dataUrl) {
        this.foto.set(foto.dataUrl);
        await this.guardarPerfil();
      }
    } catch (error) {
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
}
