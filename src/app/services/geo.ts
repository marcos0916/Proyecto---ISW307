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
  private watchId: string | null = null;

 
  async checkAndRequestPermissions(): Promise<boolean> {
    try {
      const status: PermissionStatus = await Geolocation.checkPermissions();

      if (status.location === 'denied') {
        return false;
      }

      if (status.location === 'prompt' || status.location === 'prompt-with-rationale') {
        try {
          const requested = await Geolocation.requestPermissions();
          return requested.location === 'granted';
        } catch {
        
          return true;
        }
      }

      return status.location === 'granted';
    } catch (error) {
      console.error('Error al comprobar permisos:', error);
      return true;
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
      throw new Error('No se pudo obtener tu ubicación. Verifica que aceptaste el permiso y que el GPS esté activo.');
    }
  }

  // Genera un enlace universal para compartir la ubicación
  generateShareUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  // Inicia el seguimiento continuo de la posición (ubicación en tiempo real)
  async startWatching(onUpdate: (coords: Coordinates) => void, onError: (message: string) => void): Promise<void> {
    const hasPermission = await this.checkAndRequestPermissions();
    if (!hasPermission) {
      onError('Ubicación bloqueada. Habilítala manualmente en los permisos del sitio de tu navegador y vuelve a intentarlo.');
      return;
    }

    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      (position, err) => {
        if (position) {
          onUpdate({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          return;
        }
        // 
        if (err?.code === 1) {
          onError('Se revocó el permiso de ubicación.');
        }
      }
    );
  }

  // Detiene el seguimiento continuo iniciado con startWatching
  async stopWatching(): Promise<void> {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }
}