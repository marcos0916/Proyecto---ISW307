<<<<<<< HEAD
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
} from '@ionic/angular';
import * as L from 'leaflet';

// Fix rutas de iconos default de Leaflet con bundlers
=======
import { Component, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonProgressBar,
  IonCard, IonList, IonListHeader,
  IonItem, IonLabel, IonIcon, IonBadge, IonToggle, ToastController
} from '@ionic/angular';
import { GeoService, Coordinates } from '../services/geo';
import { PlacesService, Place } from '../services/places';
import * as L from 'leaflet';
import { addIcons } from 'ionicons';
import {
  navigateOutline, shareSocialOutline, locateOutline, searchOutline,
  radioOutline, mapOutline, restaurantOutline, cafeOutline, beerOutline,
  bedOutline, cameraOutline, locationOutline, storefrontOutline
} from 'ionicons/icons';

addIcons({
  navigateOutline, shareSocialOutline, locateOutline, searchOutline,
  radioOutline, mapOutline, restaurantOutline, cafeOutline, beerOutline,
  bedOutline, cameraOutline, locationOutline, storefrontOutline
});

>>>>>>> feature/modulo-2-tareas
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
<<<<<<< HEAD
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

interface Note {
  text: string;
  date: Date;
}
=======
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});
>>>>>>> feature/modulo-2-tareas

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
<<<<<<< HEAD
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonText,
  ],
})
export class HomePage implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private marker?: L.Marker;
  private watchId?: string;
  private browserWatchId?: number;

  coordsText = '';
  isTracking = false;

  noteText = '';
  notes: Note[] = [];

  private readonly storageKey = 'app-notes';

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([18.4861, -69.9312], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.loadNotes();

    // Fix: recalcula tamaño del mapa cuando el contenedor termine de renderizar
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);

    window.addEventListener('resize', () => {
      this.map.invalidateSize();
    });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  async locateMe(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      this.getBrowserPosition();
      return;
    }
    await Geolocation.requestPermissions();
    const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    this.update(p.coords.latitude, p.coords.longitude);
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return;
    this.isTracking = true;

    if (Capacitor.getPlatform() === 'web') {
      if (!navigator.geolocation) {
        console.error('Geolocation no soportada en este navegador');
        this.isTracking = false;
        return;
      }
      this.browserWatchId = navigator.geolocation.watchPosition(
        (pos) => this.update(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.error(err);
          this.isTracking = false;
        },
        { enableHighAccuracy: true }
      );
      return;
    }

    await Geolocation.requestPermissions();
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (p: Position | null) => {
        if (!p) return;
        this.update(p.coords.latitude, p.coords.longitude);
      }
    );
  }

  async stopTracking(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      if (this.browserWatchId !== undefined) {
        navigator.geolocation.clearWatch(this.browserWatchId);
        this.browserWatchId = undefined;
      }
      this.isTracking = false;
      return;
    }

    if (this.watchId) await Geolocation.clearWatch({ id: this.watchId });
    this.watchId = undefined;
    this.isTracking = false;
  }

  saveNote(): void {
    const text = this.noteText.trim();
    if (!text) return;

    this.notes.unshift({ text, date: new Date() });
    this.noteText = '';
    this.persistNotes();
  }

  private getBrowserPosition(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation no soportada en este navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => this.update(pos.coords.latitude, pos.coords.longitude),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }

  private loadNotes(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as Note[];
      this.notes = parsed.map((n) => ({ text: n.text, date: new Date(n.date) }));
    }
  }

  private persistNotes(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
=======
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonProgressBar,
    IonCard, IonList, IonListHeader,
    IonItem, IonLabel, IonIcon, IonBadge, IonToggle
  ]
})
export class HomePage implements AfterViewInit, OnDestroy {
  coords = signal<Coordinates | null>(null);
  places = signal<Place[]>([]);
  isLoading = signal(false);
  isTracking = signal(false);
  private map!: L.Map;
  private userMarker?: L.Marker;
  private placesLayer = L.layerGroup();

  constructor(
    private geoService: GeoService,
    private placesService: PlacesService,
    private toastCtrl: ToastController
  ) {
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.geoService.stopWatching();
  }

  // Inicializa Leaflet centrado provisionalmente
  private initMap() {
    this.map = L.map('map').setView([18.7357, -70.1627], 8); // Vista general RD

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.placesLayer.addTo(this.map);

    
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      new ResizeObserver(() => this.map.invalidateSize()).observe(mapContainer);
    }
    setTimeout(() => this.map.invalidateSize(), 300);
  }

  // Determina el ícono más adecuado según el tipo de lugar
  iconFor(type: string): string {
    const t = type.toLowerCase();
    if (t === 'restaurant' || t === 'fast_food') return 'restaurant-outline';
    if (t === 'cafe') return 'cafe-outline';
    if (t === 'bar') return 'beer-outline';
    if (t === 'hotel' || t === 'guest_house') return 'bed-outline';
    if (['museum', 'attraction', 'gallery', 'viewpoint'].includes(t)) return 'camera-outline';
    if (t === 'lugar de interés') return 'location-outline';
    return 'storefront-outline';
  }

  // Captura la posición actual mediante el GPS
  async loadCurrentLocation() {
    this.isLoading.set(true);
    try {
      const coords = await this.geoService.getCurrentPosition();
      this.coords.set(coords);
      if (coords) {
        this.updateUserMapPosition(coords.lat, coords.lng);
        this.showToast('Ubicación capturada correctamente', 'success');
      }
    } catch (error: any) {
      this.showToast(error.message || 'No se pudo obtener la ubicación', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  private updateUserMapPosition(lat: number, lng: number, recenter = true) {
    if (recenter) {
      this.map.setView([lat, lng], 15);
    }

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      this.userMarker = L.marker([lat, lng]).addTo(this.map).bindPopup('<b>Tu ubicación actual</b>').openPopup();
    }
  }

  // Activa o detiene el seguimiento continuo de la ubicación (tiempo real)
  async toggleTracking() {
    if (this.isTracking()) {
      await this.geoService.stopWatching();
      this.isTracking.set(false);
      this.showToast('Seguimiento en vivo detenido', 'medium');
      return;
    }

    this.isTracking.set(true);
    await this.geoService.startWatching(
      (coords) => {
        this.coords.set(coords);
        this.updateUserMapPosition(coords.lat, coords.lng, false);
      },
      (message) => {
        this.isTracking.set(false);
        this.showToast(message, 'danger');
      }
    );

    if (this.isTracking()) {
      this.showToast('Seguimiento en vivo activado', 'success');
    }
  }

  // Consulta la API de lugares cercanos
  async searchNearby() {
    const coords = this.coords();
    if (!coords) return;
    this.isLoading.set(true);
    this.placesLayer.clearLayers();

    try {
      const places = await this.placesService.getNearbyPlaces(coords.lat, coords.lng);
      this.places.set(places);

      if (places.length === 0) {
        this.showToast('No se encontraron sitios cercanos en esta zona.', 'medium');
      } else {
        places.forEach(p => {
          L.marker([p.lat, p.lng])
            .bindPopup(`<b>${p.name}</b><br>${p.type}`)
            .addTo(this.placesLayer);
        });
        this.showToast(`Se encontraron ${places.length} sitios de interés.`, 'primary');
      }
    } catch (error: any) {
      this.places.set([]);
      this.showToast(error.message || 'Error al buscar sitios cercanos', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  focusOnMap(lat: number, lng: number) {
    this.map.setView([lat, lng], 17);
  }

  async shareLocation() {
    const coords = this.coords();
    if (!coords) return;
    const url = this.geoService.generateShareUrl(coords.lat, coords.lng);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi ubicación',
          text: 'Te comparto mi ubicación en tiempo real:',
          url: url
        });
      } catch (err) {
        console.log('Compartir cancelado');
      }
    } else {
      await navigator.clipboard.writeText(url);
      this.showToast('Enlace de ubicación copiado al portapapeles', 'medium');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'primary' | 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
>>>>>>> feature/modulo-2-tareas
  }

  private update(lat: number, lng: number): void {
    this.coordsText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    this.map.invalidateSize();
    this.map.setView([lat, lng], 16);
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lng]).addTo(this.map).bindPopup('Tu ubicación');
  }
}
