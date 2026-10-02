import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonBadge,
  IonSearchbar, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  IonIcon, IonProgressBar, ToastController, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trashOutline, addOutline, checkmarkCircle, ellipseOutline,
  flag, clipboardOutline, searchOutline, timeOutline,
  checkmarkDoneCircleOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../services/database';
import { Tarea } from '../../models/tarea.model';
import { NuevaTareaModalComponent, NuevaTareaResult } from './nueva-tarea-modal.component';

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
    IonIcon, IonProgressBar
  ]
})
export class TareasPage implements OnInit {
  tareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  busqueda: string = '';

  constructor(
    private dbService: DatabaseService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      trashOutline, addOutline, checkmarkCircle, ellipseOutline,
      flag, clipboardOutline, searchOutline, timeOutline,
      checkmarkDoneCircleOutline
    });
  }

  get totalTareas(): number {
    return this.tareas.length;
  }

  get completadasCount(): number {
    return this.tareas.filter(t => t.completada === 1).length;
  }

  get progreso(): number {
    return this.totalTareas === 0 ? 0 : this.completadasCount / this.totalTareas;
  }

  colorPrioridad(prioridad: Tarea['prioridad']): string {
    return prioridad === 'alta' ? 'danger' : prioridad === 'media' ? 'warning' : 'success';
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
    const modal = await this.modalCtrl.create({
      component: NuevaTareaModalComponent,
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss<NuevaTareaResult>();
    if (role !== 'confirm' || !data) return;

    await this.dbService.addTarea({
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
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