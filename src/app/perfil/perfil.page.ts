import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

/**
 * Configuración = Módulo 5 (Bluetooth/NFC + Perfil, Estudiante E). Perfil,
 * Bluetooth y NFC son el mismo módulo, por eso comparten esta página con un
 * segmento en vez de ser tabs separados — "Podcasts" como tab aparte era
 * un error de mapeo, esa ruta le corresponde al Módulo 4 (Multimedia), que
 * todavía no está mergeado.
 */
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
  // Signals en vez de propiedades planas: esta app corre Angular sin zone.js
  // (ver angular.json, "polyfills": []), así que mutar un campo normal tras
  // un `await` (cargar el perfil guardado, la foto, etc.) no dispara
  // detección de cambios. Confirmado con pruebas en vivo: sin esto, el
  // perfil guardado no se veía al reabrir la página.
  nombre = signal('');
  carrera = signal('');
  correo = signal('');
  foto = signal('');

  // Configuraciones: preferencias internas de la app, no activan hardware directamente.
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
      // El usuario cancelando la selección también cae acá; no es un error real.
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
