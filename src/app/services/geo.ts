import { Injectable } from '@angular/core';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  //Aqui Comprueba y solicita permisos nativos de ubicación
  async checkAndRequestPermissions(): Promise<boolean> {
    try {
      let status: PermissionStatus = await Geolocation.checkPermissions();

      if (status.location === 'prompt' || status.location === 'prompt-with-rationale') {
        status = await Geolocation.requestPermissions();
      }

      return status.location === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  // Aqui obtiene las coordenadas GPS actuales con alta precisión
  async getCurrentPosition(): Promise<Coordinates | null> {
    const hasPermission = await this.checkAndRequestPermissions();
    if (!hasPermission) {
      throw new Error('Ubicación bloqueada. Habilítala manualmente en los permisos del sitio de tu navegador y vuelve a intentarlo.');
    }

    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.error('Error al capturar coordenadas:', error);
      return null;
    }
  }

  // Genera un enlace universal para compartir la ubicación
  generateShareUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}