import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isNative: boolean = false;
  private dbName: string = 'campusapp_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.isNative = Capacitor.isNativePlatform();
  }

  async initDatabase(): Promise<void> {
    if (this.isNative) {
      try {
        const ret = await this.sqlite.checkConnectionsConsistency();
        const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

        if (ret.result && isConn) {
          this.db = await this.sqlite.retrieveConnection(this.dbName, false);
        } else {
          this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
        }

        await this.db.open();

        const schema = `
          CREATE TABLE IF NOT EXISTS tareas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descripcion TEXT,
            prioridad TEXT DEFAULT 'media',
            completada INTEGER DEFAULT 0,
            fechaCreacion TEXT
          );
        `;
        await this.db.execute(schema);
      } catch (err) {
        console.error('Error inicializando SQLite nativo:', err);
      }
    } else {
      if (!localStorage.getItem('tareas_mock')) {
        const initialData: Tarea[] = [
          { id: 1, titulo: 'Entrega Proyecto Final', descripcion: 'Completar módulos de Ionic', prioridad: 'alta', completada: 0, fechaCreacion: new Date().toISOString() },
          { id: 2, titulo: 'Estudiar Unidad 9', descripcion: 'Repasar persistencia con SQLite', prioridad: 'media', completada: 1, fechaCreacion: new Date().toISOString() }
        ];
        localStorage.setItem('tareas_mock', JSON.stringify(initialData));
      }
    }
  }

  async getTareas(): Promise<Tarea[]> {
    if (this.isNative) {
      const res = await this.db.query('SELECT * FROM tareas ORDER BY id DESC;');
      return (res.values as Tarea[]) || [];
    } else {
      const data = localStorage.getItem('tareas_mock');
      return data ? JSON.parse(data) : [];
    }
  }

  async addTarea(tarea: Omit<Tarea, 'id'>): Promise<void> {
    const fecha = new Date().toISOString();
    if (this.isNative) {
      const sql = 'INSERT INTO tareas (titulo, descripcion, prioridad, completada, fechaCreacion) VALUES (?, ?, ?, ?, ?);';
      await this.db.run(sql, [tarea.titulo, tarea.descripcion || '', tarea.prioridad, 0, fecha]);
    } else {
      const tareas = await this.getTareas();
      const nuevoId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id || 0)) + 1 : 1;
      tareas.unshift({ ...tarea, id: nuevoId, completada: 0, fechaCreacion: fecha });
      localStorage.setItem('tareas_mock', JSON.stringify(tareas));
    }
  }

  async updateTarea(id: number, cambios: Pick<Tarea, 'titulo' | 'descripcion' | 'prioridad'>): Promise<void> {
    if (this.isNative) {
      const sql = 'UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?;';
      await this.db.run(sql, [cambios.titulo, cambios.descripcion || '', cambios.prioridad, id]);
    } else {
      const tareas = await this.getTareas();
      const idx = tareas.findIndex(t => t.id === id);
      if (idx !== -1) {
        tareas[idx] = { ...tareas[idx], ...cambios };
        localStorage.setItem('tareas_mock', JSON.stringify(tareas));
      }
    }
  }

  async updateEstadoTarea(id: number, completada: number): Promise<void> {
    if (this.isNative) {
      await this.db.run('UPDATE tareas SET completada = ? WHERE id = ?;', [completada, id]);
    } else {
      const tareas = await this.getTareas();
      const idx = tareas.findIndex(t => t.id === id);
      if (idx !== -1) {
        tareas[idx].completada = completada;
        localStorage.setItem('tareas_mock', JSON.stringify(tareas));
      }
    }
  }

  async deleteTarea(id: number): Promise<void> {
    if (this.isNative) {
      await this.db.run('DELETE FROM tareas WHERE id = ?;', [id]);
    } else {
      let tareas = await this.getTareas();
      tareas = tareas.filter(t => t.id !== id);
      localStorage.setItem('tareas_mock', JSON.stringify(tareas));
    }
  }
}