import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBadge,
  IonItem,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonIcon,
  ToastController
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { NetworkService } from '../services/network';
import { DataService, TaskItem } from '../services/data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBadge,
    IonItem,
    IonInput,
    IonButton,
    IonList,
    IonLabel,
    IonIcon
  ]
})
export class HomePage implements OnInit {
  isOnline$!: Observable<boolean>;
  items$!: Observable<TaskItem[]>;
  newItemTitle: string = '';
  private wasOfflineBefore: boolean = false;

  constructor(
    private networkService: NetworkService,
    private dataService: DataService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.isOnline$ = this.networkService.isOnline$;
    this.items$ = this.dataService.items;

    // Escucha cambios de red para notificar al usuario
    this.networkService.isOnline$.subscribe(async (isOnline) => {
      if (!isOnline) {
        this.wasOfflineBefore = true;
        await this.showToast(
          'Modo offline activo: puedes seguir creando notas y se guardarán en tu dispositivo.',
          'warning',
          3000
        );
      } else if (this.wasOfflineBefore) {
        this.wasOfflineBefore = false;
        await this.showToast(
          '¡Conexión restaurada! Sincronizando tus datos pendientes...',
          'success',
          2500
        );
      }
    });
  }

  async saveItem() {
    if (!this.newItemTitle.trim()) return;

    const isOnline = this.networkService.isOnlineValue;
    this.dataService.addItem(this.newItemTitle);
    this.newItemTitle = '';

    if (!isOnline) {
      await this.showToast(
        'Nota guardada localmente. Se sincronizará automáticamente al volver la red.',
        'medium',
        2500
      );
    }
  }

  private async showToast(message: string, color: string, duration: number) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}