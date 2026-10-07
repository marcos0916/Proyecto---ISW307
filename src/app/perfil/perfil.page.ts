import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage';

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

type VistaConfiguracion = 'perfil' | 'bluetooth';

/**
 * Configuración = Módulo 5 (Bluetooth/NFC + Perfil, Estudiante E). Perfil y
 * Bluetooth son el mismo módulo, por eso comparten esta página con un
 * segmento en vez de ser dos tabs separados — "Podcasts" como tab aparte era
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
    CommonModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit {
  nombre: string = '';
  carrera: string = '';
  correo: string = '';

  vista: VistaConfiguracion = 'perfil';

  constructor(private storageService: StorageService) {
    addIcons({
      person
    });
  }

  async ngOnInit() {
    const perfil = await this.storageService.obtenerPerfil();

    if (perfil) {
      this.nombre = perfil.nombre;
      this.carrera = perfil.carrera;
      this.correo = perfil.correo;
    }
  }

  cambiarVista(event: CustomEvent) {
    this.vista = event.detail.value as VistaConfiguracion;
  }

  async guardarPerfil() {
    const perfil = {
      nombre: this.nombre,
      carrera: this.carrera,
      correo: this.correo
    };

    await this.storageService.guardarPerfil(perfil);
  }
}
