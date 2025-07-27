/**
 * Interfaz de Cuartel alineada con el modelo de Mongoose IBarracks
 */
export interface Cuartel {
  _id?: string | number;  // Campo automático generado por la base de datos
  barracks: string;      // Nombre del cuartel (requerido)
  species: string;       // Especie (requerido)
  variety: string;       // Variedad (requerido)
  phenologicalState: string; // Estado fenológico (requerido)
  state: boolean;        // Estado activo/inactivo (requerido)
  createdAt?: Date;      // Campos automáticos de timestamps
  updatedAt?: Date;      // Campos automáticos de timestamps
} 