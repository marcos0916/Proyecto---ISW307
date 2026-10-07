import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonButton,
  IonIcon
} from '@ionic/angular';
import { NoticiasService, Noticia } from '../../services/noticias.service';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonText,
    IonButton,
    IonIcon
  ]
})
export class NoticiasPage implements OnInit {
  // Signals en vez de propiedades planas: esta app corre Angular sin zone.js
  // (ver angular.json, "polyfills": []), así que mutar un campo normal dentro
  // de un callback de .subscribe() no dispara detección de cambios. Los
  // signals sí lo hacen.
  noticias = signal<Noticia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    this.cargarNoticias();
  }

  cargarNoticias(event?: any) {
    if (!event) this.cargando.set(true);
    this.error.set(null);

    this.noticiasService.getNoticias().subscribe({
      next: (data) => {
        this.noticias.set(data);
        this.cargando.set(false);
        if (event) event.target.complete();
      },
      error: (err) => {
        this.error.set('No fue posible cargar las noticias. Verifica tu conexión.');
        this.cargando.set(false);
        if (event) event.target.complete();
      }
    });
  }

  recargar(event: any) {
    this.cargarNoticias(event);
  }
}