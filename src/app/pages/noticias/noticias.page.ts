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
import { addIcons } from 'ionicons';
import {
  schoolOutline, calendarOutline, megaphoneOutline, basketballOutline, colorPaletteOutline, newspaperOutline
} from 'ionicons/icons';
import { NoticiasService, Noticia } from '../../services/noticias.service';

const ICONO_POR_CATEGORIA: Record<string, string> = {
  'Académico': 'school-outline',
  'Evento': 'calendar-outline',
  'Comunicado': 'megaphone-outline',
  'Deportes': 'basketball-outline',
  'Cultura': 'color-palette-outline'
};

const CLASE_POR_CATEGORIA: Record<string, string> = {
  'Académico': 'chip-academico',
  'Evento': 'chip-evento',
  'Comunicado': 'chip-comunicado',
  'Deportes': 'chip-deportes',
  'Cultura': 'chip-cultura'
};

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
  noticias = signal<Noticia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(private noticiasService: NoticiasService) {
    addIcons({ schoolOutline, calendarOutline, megaphoneOutline, basketballOutline, colorPaletteOutline, newspaperOutline });
  }

  ngOnInit() {
    this.cargarNoticias();
  }

  iconoCategoria(categoria: string): string {
    return ICONO_POR_CATEGORIA[categoria] || 'newspaper-outline';
  }

  claseCategoria(categoria: string): string {
    return CLASE_POR_CATEGORIA[categoria] || 'chip-comunicado';
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