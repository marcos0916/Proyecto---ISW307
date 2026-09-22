import { Injectable } from '@angular/core';

export interface Place {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';

  async getNearbyPlaces(lat: number, lng: number, radiusMeters: number = 1000): Promise<Place[]> {
    // Consulta en lenguaje Overpass QL buscando nodos de tipo amenity (restaurantes, cafés), tiendas o turismo
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"restaurant|cafe|fast_food|bar"](around:${radiusMeters},${lat},${lng});
        node["shop"](around:${radiusMeters},${lat},${lng});
        node["tourism"](around:${radiusMeters},${lat},${lng});
      );
      out body 15;
    `;

    let response: Response;
    try {
      response = await fetch(`${this.OVERPASS_API}?data=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Error de red en PlacesService:', error);
      throw new Error('No se pudo conectar. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    if (!response.ok) {
      throw new Error('El servicio de lugares cercanos no respondió correctamente. Inténtalo más tarde.');
    }

    const data = await response.json();

    return (data.elements || [])
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags.amenity || el.tags.shop || el.tags.tourism || 'Lugar de interés',
        lat: el.lat,
        lng: el.lon
      }));
  }
}