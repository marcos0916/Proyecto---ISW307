import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

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

  async guardarPerfil(perfil: any) {
    await this.storageReady;
    await this.storage.set('perfil', perfil);
  }

  async obtenerPerfil() {
    await this.storageReady;
    return await this.storage.get('perfil');
  }

  async guardarConfiguracion(configuracion: any) {
    await this.storageReady;
    await this.storage.set('configuracion', configuracion);
  }

  async obtenerConfiguracion() {
    await this.storageReady;
    return await this.storage.get('configuracion');
  }
}