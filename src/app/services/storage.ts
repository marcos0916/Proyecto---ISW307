import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Perfil {
  nombre: string;
  carrera: string;
  correo: string;
  /** Data URL (base64) de la foto de perfil, o vacío si no hay foto guardada. */
  foto?: string;
}

export interface Configuracion {
  notificaciones: boolean;
  bluetooth: boolean;
  nfc: boolean;
}

export interface RegistroCompartido {
  texto: string;
  fecha: string;
  tipo: string;
}

/** Claves usadas en Ionic Storage, centralizadas para no repetir strings sueltos. */
const CLAVE_PERFIL = 'perfil';
const CLAVE_CONFIGURACION = 'configuracion';
const CLAVE_HISTORIAL = 'historialCompartidos';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage!: Storage;
  private storageReady: Promise<void>;

  constructor(private storageService: Storage) {
    this.storageReady = this.init();
  }

  async init() {
    this.storage = await this.storageService.create();
  }

  async guardarPerfil(perfil: Perfil) {
    await this.storageReady;
    await this.storage.set(CLAVE_PERFIL, perfil);
  }

  async obtenerPerfil(): Promise<Perfil | null> {
    await this.storageReady;
    return await this.storage.get(CLAVE_PERFIL);
  }

  async guardarConfiguracion(configuracion: Configuracion) {
    await this.storageReady;
    await this.storage.set(CLAVE_CONFIGURACION, configuracion);
  }

  async obtenerConfiguracion(): Promise<Configuracion | null> {
    await this.storageReady;
    return await this.storage.get(CLAVE_CONFIGURACION);
  }

  async agregarHistorial(registro: RegistroCompartido) {
    await this.storageReady;
    const historial = await this.obtenerHistorial();
    historial.unshift(registro);
    await this.storage.set(CLAVE_HISTORIAL, historial);
  }

  async obtenerHistorial(): Promise<RegistroCompartido[]> {
    await this.storageReady;
    const historial = await this.storage.get(CLAVE_HISTORIAL);
    return historial || [];
  }

  async limpiarHistorial() {
    await this.storageReady;
    await this.storage.set(CLAVE_HISTORIAL, []);
  }
}
