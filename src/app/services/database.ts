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
  private isNative: boolean;
  private dbName = 'campusapp_db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.isNative = Capacitor.isNativePlatform();
  }

  async initDatabase(): Promise<void> {
    if (!this.isNative) {
      await this.esperarJeepSqlite();
      await this.sqlite.initWebStore();
    }

    const ret = await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

    this.db = ret.result && isConn
      ? await this.sqlite.retrieveConnection(this.dbName, false)
      : await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);

    await this.db.open();

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        prioridad TEXT DEFAULT 'media',
        completada INTEGER DEFAULT 0,
        orden INTEGER,
        fechaCreacion TEXT
      );
    `);

    // Migración liviana: bases creadas con una versión anterior del esquema no tienen
    // la columna "orden". Se verifica con PRAGMA en vez de probar/capturar el ALTER,
    // porque el puente web de Capacitor no siempre propaga ese rechazo de forma limpia.
    const columnas = await this.db.query('PRAGMA table_info(tareas);');
    const tieneOrden = (columnas.values || []).some((c: { name: string }) => c.name === 'orden');
    if (!tieneOrden) {
      await this.db.execute('ALTER TABLE tareas ADD COLUMN orden INTEGER;');
    }

    // Tareas existentes sin "orden" asignado quedan ordenadas por id de creación.
    await this.db.run('UPDATE tareas SET orden = id WHERE orden IS NULL;');

    await this.sembrarDatosIniciales();
  }

  /** Primera ejecución con la tabla vacía: deja un par de tareas de ejemplo. */
  private async sembrarDatosIniciales(): Promise<void> {
    const conteo = await this.db.query('SELECT COUNT(*) AS total FROM tareas;');
    if ((conteo.values?.[0]?.total ?? 0) > 0) return;

    const fecha = new Date().toISOString();
    await this.db.run(
      'INSERT INTO tareas (titulo, descripcion, prioridad, completada, orden, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?);',
      ['Entrega Proyecto Final', 'Completar módulos de Ionic', 'alta', 0, 1, fecha]
    );
    await this.db.run(
      'INSERT INTO tareas (titulo, descripcion, prioridad, completada, orden, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?);',
      ['Estudiar Unidad 9', 'Repasar persistencia con SQLite', 'media', 1, 2, fecha]
    );
  }

  /** jeep-sqlite tarda un instante en registrarse e inicializar su propio store en IndexedDB. */
  private async esperarJeepSqlite(): Promise<void> {
    await customElements.whenDefined('jeep-sqlite');
    const jeepEl = document.querySelector('jeep-sqlite') as (HTMLElement & { componentOnReady?: () => Promise<unknown> }) | null;
    if (jeepEl?.componentOnReady) {
      await jeepEl.componentOnReady();
    }
  }

  async getTareas(): Promise<Tarea[]> {
    const res = await this.db.query('SELECT * FROM tareas ORDER BY orden ASC, id DESC;');
    return (res.values as Tarea[]) || [];
  }

  async addTarea(tarea: Omit<Tarea, 'id'>): Promise<void> {
    const fecha = new Date().toISOString();
    const maxOrdenRes = await this.db.query('SELECT MAX(orden) AS maxOrden FROM tareas;');
    const siguienteOrden = (maxOrdenRes.values?.[0]?.maxOrden ?? 0) + 1;

    const sql = 'INSERT INTO tareas (titulo, descripcion, prioridad, completada, orden, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?);';
    await this.db.run(sql, [tarea.titulo, tarea.descripcion || '', tarea.prioridad, 0, siguienteOrden, fecha]);
  }

  async updateTarea(id: number, cambios: Pick<Tarea, 'titulo' | 'descripcion' | 'prioridad'>): Promise<void> {
    const sql = 'UPDATE tareas SET titulo = ?, descripcion = ?, prioridad = ? WHERE id = ?;';
    await this.db.run(sql, [cambios.titulo, cambios.descripcion || '', cambios.prioridad, id]);
  }

  async updateEstadoTarea(id: number, completada: number): Promise<void> {
    await this.db.run('UPDATE tareas SET completada = ? WHERE id = ?;', [completada, id]);
  }

  async deleteTarea(id: number): Promise<void> {
    await this.db.run('DELETE FROM tareas WHERE id = ?;', [id]);
  }

  /** Persiste el nuevo orden tras un drag & drop. `idsEnOrden` ya viene en el orden final deseado. */
  async reordenarTareas(idsEnOrden: number[]): Promise<void> {
    const statements = idsEnOrden.map((id, index) => ({
      statement: 'UPDATE tareas SET orden = ? WHERE id = ?;',
      values: [index, id]
    }));
    await this.db.executeSet(statements);
  }
}
