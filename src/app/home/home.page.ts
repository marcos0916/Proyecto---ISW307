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
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

interface Note {
  text: string;
  date: Date;
}

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
  }

  private update(lat: number, lng: number): void {
    this.coordsText = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    this.map.invalidateSize();
    this.map.setView([lat, lng], 16);
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lng]).addTo(this.map).bindPopup('Tu ubicación');
  }
}
