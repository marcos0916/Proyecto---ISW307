import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonTextarea, IonIcon, IonFooter,
  ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, flag } from 'ionicons/icons';
import { Tarea } from '../../models/tarea.model';

export interface TareaFormResult {
  id?: number;
  titulo: string;
  descripcion: string;
  prioridad: Tarea['prioridad'];
}

@Component({
  selector: 'app-tarea-form-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonTextarea, IonIcon, IonFooter
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="modal-toolbar">
        <ion-title>{{ tarea ? 'Editar Tarea' : 'Nueva Tarea' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancelar()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item class="campo" lines="inset">
        <ion-input
          label="Título"
          labelPlacement="stacked"
          placeholder="¿Qué necesitas hacer?"
          [(ngModel)]="titulo"
          autofocus="true">
        </ion-input>
      </ion-item>

      <ion-item class="campo" lines="inset">
        <ion-textarea
          label="Descripción (opcional)"
          labelPlacement="stacked"
          placeholder="Agrega detalles..."
          [(ngModel)]="descripcion"
          autoGrow="true"
          rows="2">
        </ion-textarea>
      </ion-item>

      <p class="prioridad-titulo">Prioridad</p>
      <div class="prioridad-picker">
        <button
          type="button"
          class="chip chip-baja"
          [class.selected]="prioridad === 'baja'"
          (click)="prioridad = 'baja'">
          <ion-icon name="flag"></ion-icon> Baja
        </button>
        <button
          type="button"
          class="chip chip-media"
          [class.selected]="prioridad === 'media'"
          (click)="prioridad = 'media'">
          <ion-icon name="flag"></ion-icon> Media
        </button>
        <button
          type="button"
          class="chip chip-alta"
          [class.selected]="prioridad === 'alta'"
          (click)="prioridad = 'alta'">
          <ion-icon name="flag"></ion-icon> Alta
        </button>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border ion-padding">
      <ion-button expand="block" [disabled]="!titulo.trim()" (click)="guardar()">
        {{ tarea ? 'Guardar cambios' : 'Guardar tarea' }}
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    .modal-toolbar {
      --background: #4f46e5;
      --color: #fff;

      ion-title {
        font-weight: 700;
        letter-spacing: 0.01em;
      }
    }

    ion-footer ion-button {
      --background: #4f46e5;
      --background-activated: #4338ca;
      --background-hover: #4338ca;
      font-weight: 600;
    }

    .campo {
      --background: var(--ion-item-background, #fff);
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .prioridad-titulo {
      margin: 4px 2px 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ion-color-medium, #92949c);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .prioridad-picker {
      display: flex;
      gap: 8px;
    }

    .chip {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 0;
      border-radius: 999px;
      border: 1.5px solid var(--ion-color-step-200, #d7d8da);
      background: transparent;
      color: var(--ion-color-medium, #92949c);
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.15s ease;

      ion-icon {
        font-size: 1rem;
      }

      &.chip-baja.selected {
        background: var(--ion-color-success);
        border-color: var(--ion-color-success);
        color: var(--ion-color-success-contrast, #fff);
      }

      &.chip-media.selected {
        background: var(--ion-color-warning);
        border-color: var(--ion-color-warning);
        color: var(--ion-color-warning-contrast, #000);
      }

      &.chip-alta.selected {
        background: var(--ion-color-danger);
        border-color: var(--ion-color-danger);
        color: var(--ion-color-danger-contrast, #fff);
      }
    }
  `]
})
export class TareaFormModalComponent implements OnInit {
  @Input() tarea: Tarea | null = null;

  titulo = '';
  descripcion = '';
  prioridad: Tarea['prioridad'] = 'media';

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, flag });
  }

  ngOnInit() {
    if (this.tarea) {
      this.titulo = this.tarea.titulo;
      this.descripcion = this.tarea.descripcion || '';
      this.prioridad = this.tarea.prioridad;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  guardar() {
    if (!this.titulo.trim()) return;
    const result: TareaFormResult = {
      id: this.tarea?.id,
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      prioridad: this.prioridad
    };
    this.modalCtrl.dismiss(result, 'confirm');
  }
}
