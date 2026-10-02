import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonBadge,
  IonSearchbar, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  IonIcon, IonCheckbox, ToastController, AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { DatabaseService } from '../../services/database';
import { Tarea } from '../../models/tarea.model';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonBadge,
    IonSearchbar, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
    IonIcon, IonCheckbox
  ]
})
export class TareasPage implements OnInit {
  tareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  busqueda: string = '';

  constructor(
    private dbService: DatabaseService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ trashOutline, addOutline, checkmarkCircleOutline });
  }

  async ngOnInit() {
    await this.dbService.initDatabase();
    await this.cargarTareas();
  }

  async cargarTareas() {
    this.tareas = await this.dbService.getTareas();
    this.filtrar();
  }

  filtrar() {
    if (!this.busqueda.trim()) {
      this.tareasFiltradas = [...this.tareas];
    } else {
      const q = this.busqueda.toLowerCase();
      this.tareasFiltradas = this.tareas.filter(t =>
        t.titulo.toLowerCase().includes(q) || (t.descripcion && t.descripcion.toLowerCase().includes(q))
      );
    }
  }

  async doRefresh(event: any) {
    await this.cargarTareas();
    event.target.complete();
  }

  async toggleCompletada(tarea: Tarea) {
    const nuevoEstado = tarea.completada === 1 ? 0 : 1;
    tarea.completada = nuevoEstado;
    if (tarea.id) {
      await this.dbService.updateEstadoTarea(tarea.id, nuevoEstado);
    }
  }

  async eliminar(tarea: Tarea, slidingItem: any) {
    slidingItem.close();
    if (!tarea.id) return;

    await this.dbService.deleteTarea(tarea.id);
    await this.cargarTareas();

    const toast = await this.toastCtrl.create({
      message: 'Tarea eliminada exitosamente',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    toast.present();
  }

  async abrirModalNuevaTarea() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Tarea',
      inputs: [
        { name: 'titulo', type: 'text', placeholder: 'Título de la tarea' },
        { name: 'descripcion', type: 'textarea', placeholder: 'Descripción (opcional)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data: { titulo: string; descripcion?: string }) => {
            if (data.titulo && data.titulo.trim() !== '') {
              await this.dbService.addTarea({
                titulo: data.titulo.trim(),
                descripcion: data.descripcion?.trim() || '',
                prioridad: 'media',
                completada: 0
              });
              await this.cargarTareas();
              const toast = await this.toastCtrl.create({
                message: 'Tarea guardada',
                duration: 2000,
                color: 'success'
              });
              toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}