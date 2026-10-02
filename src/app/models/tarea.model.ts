export interface Tarea {
  id?: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta';
  completada: number;
  fechaCreacion?: string;
}