import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage';

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
  IonInput,
  IonButton,
  IonIcon,
  IonToggle
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';

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
    IonInput,
    IonButton,
    IonIcon,
    IonToggle,
    CommonModule,
    FormsModule
  ]
})
export class PerfilPage implements OnInit  {
    nombre: string = '';
    carrera: string = '';
    correo: string = '';

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
 async guardarPerfil() {
  const perfil = {
  nombre: this.nombre,
  carrera: this.carrera,
  correo: this.correo
};

  await this.storageService.guardarPerfil(perfil);
}
}