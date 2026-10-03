export interface Tarea {
  id?: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta';
  completada: number;
  orden?: number;
  fechaCreacion?: string;
}