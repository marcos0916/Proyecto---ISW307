import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonBadge,
  IonSearchbar, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
  IonIcon, IonProgressBar, IonReorderGroup, IonReorder, ToastController, ModalController,
  ReorderEndCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trashOutline, addOutline, checkmarkCircle, ellipseOutline,
  flag, clipboardOutline, searchOutline, timeOutline,
  checkmarkDoneCircleOutline, createOutline, reorderThreeOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../services/database';
import { Tarea } from '../../models/tarea.model';
import { TareaFormModalComponent, TareaFormResult } from './tarea-form-modal.component';
import { LongPressDirective } from '../../directives/long-press.directive';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonBadge,
    IonSearchbar, IonRefresher, IonRefresherContent, IonFab, IonFabButton,
    IonIcon, IonProgressBar, IonReorderGroup, IonReorder, LongPressDirective
  ]
})
export class TareasPage implements OnInit {

  tareas = signal<Tarea[]>([]);
  busqueda = signal('');

  tareasFiltradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const lista = this.tareas();
    if (!q) return lista;
    return lista.filter(t =>
      t.titulo.toLowerCase().includes(q) || (t.descripcion && t.descripcion.toLowerCase().includes(q))
    );
  });

  totalTareas = computed(() => this.tareas().length);
  completadasCount = computed(() => this.tareas().filter(t => t.completada === 1).length);
  progreso = computed(() => this.totalTareas() === 0 ? 0 : this.completadasCount() / this.totalTareas());

  constructor(
    private dbService: DatabaseService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      trashOutline, addOutline, checkmarkCircle, ellipseOutline,
      flag, clipboardOutline, searchOutline, timeOutline,
      checkmarkDoneCircleOutline, createOutline, reorderThreeOutline
    });
  }

  colorPrioridad(prioridad: Tarea['prioridad']): string {
    return prioridad === 'alta' ? 'danger' : prioridad === 'media' ? 'warning' : 'success';
  }

  async ngOnInit() {
    await this.dbService.initDatabase();
    await this.cargarTareas();
  }

  async cargarTareas() {
    this.tareas.set(await this.dbService.getTareas());
  }

  onBusquedaChange(valor: string | null | undefined) {
    this.busqueda.set(valor || '');
  }

  async doRefresh(event: any) {
    await this.cargarTareas();
    event.target.complete();
  }

  async toggleCompletada(tarea: Tarea) {
    if (!tarea.id) return;
    const nuevoEstado = tarea.completada === 1 ? 0 : 1;
    await this.dbService.updateEstadoTarea(tarea.id, nuevoEstado);
    await this.cargarTareas();
  }

  async eliminar(tarea: Tarea, slidingItem: any) {
    await slidingItem.close();
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

  async editar(tarea: Tarea, slidingItem?: any) {
    await slidingItem?.close();
    await this.abrirModalTarea(tarea);
  }

  async onReorder(event: ReorderEndCustomEvent) {
    const reordenada = event.detail.complete(this.tareas()) as Tarea[];
    this.tareas.set(reordenada);

    const ids = reordenada.map(t => t.id).filter((id): id is number => id != null);
    await this.dbService.reordenarTareas(ids);
  }

  async abrirModalNuevaTarea() {
    await this.abrirModalTarea();
  }

  private async abrirModalTarea(tareaExistente?: Tarea) {
    const modal = await this.modalCtrl.create({
      component: TareaFormModalComponent,
      componentProps: { tarea: tareaExistente ?? null }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss<TareaFormResult>();
    if (role !== 'confirm' || !data) return;

    if (data.id) {
      await this.dbService.updateTarea(data.id, {
        titulo: data.titulo,
        descripcion: data.descripcion,
        prioridad: data.prioridad
      });
    } else {
      await this.dbService.addTarea({
        titulo: data.titulo,
        descripcion: data.descripcion,
        prioridad: data.prioridad,
        completada: 0
      });
    }
    await this.cargarTareas();

    const toast = await this.toastCtrl.create({
      message: data.id ? 'Tarea actualizada' : 'Tarea guardada',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}
