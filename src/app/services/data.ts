import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NetworkService } from './network';

export interface TaskItem {
  id: string;
  title: string;
  createdAt: string;
  synced: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'app_offline_items';
  private readonly QUEUE_KEY = 'app_sync_queue';

  private items$ = new BehaviorSubject<TaskItem[]>([]);

  constructor(private networkService: NetworkService) {
    this.loadInitialData();
    this.listenToNetworkChanges();
  }

  get items(): Observable<TaskItem[]> {
    return this.items$.asObservable();
  }

  private loadInitialData() {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (rawData) {
      this.items$.next(JSON.parse(rawData));
    }
  }

  private listenToNetworkChanges() {
    this.networkService.isOnline$.subscribe(isOnline => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  public addItem(title: string): TaskItem {
    const newItem: TaskItem = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      synced: this.networkService.isOnlineValue
    };

    const currentItems = this.items$.value;
    const updatedItems = [newItem, ...currentItems];
    this.saveItemsLocally(updatedItems);

    if (!this.networkService.isOnlineValue) {
      this.enqueueItem(newItem);
    } else {
      console.log('Online: elemento sincronizado directamente:', newItem);
    }

    return newItem;
  }

  private saveItemsLocally(items: TaskItem[]) {
    this.items$.next(items);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  private enqueueItem(item: TaskItem) {
    const queue = this.getQueue();
    queue.push(item);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    console.log('Offline: guardado en cola para sincronizar luego:', item);
  }

  private getQueue(): TaskItem[] {
    const rawQueue = localStorage.getItem(this.QUEUE_KEY);
    return rawQueue ? JSON.parse(rawQueue) : [];
  }

  private async processQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`Conexión recuperada: sincronizando ${queue.length} elementos pendientes...`);

    for (const item of queue) {
      await this.syncWithBackend(item);
    }

    const currentItems = this.items$.value.map(item => ({
      ...item,
      synced: true
    }));

    this.saveItemsLocally(currentItems);
    localStorage.removeItem(this.QUEUE_KEY);
    console.log('Sincronización completada con éxito.');
  }

  private syncWithBackend(item: TaskItem): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Elemento subido al servidor remoto:', item.id);
        resolve(true);
      }, 500);
    });
  }
}