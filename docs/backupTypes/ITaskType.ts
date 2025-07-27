import { Document } from 'mongoose';

/**
 * Tipos de faena válidos que aparecen en la columna "Tipo Faena".
 * – AgriculturalWork  → "Labor Agrícola"
 * – Application       → "Aplicaciones" (aplicación de agroquímicos / fertilizantes)
 * – Harvest           → "Cosecha"
 */
export type WorkType =
  | 'A'
  | 'C'
  | 'T';

/**
 * Lugares de uso que se despliegan en la columna "Usar en:"
 * – Sofia            → módulo web
 * – AppSofia         → aplicación móvil
 * – Sofia-AppSofia   → ambos
 * – Deactivate       → desactivada (no disponible)
 */
export type UsageScope =
  | 'Sofia'
  | 'AppSofia'
  | 'Sofia-AppSofia'
  | 'Deactivate';

/**
 * Entidad padre → Faena (TaskType).
 * Cada registro agrupa un conjunto de labores (Task) con sus precios.
 */
export interface ITaskType extends Document {

  _id: string;

  /** Nombre de la faena agrícola ("Nombre de Faena Agrícola *"). */
  name: string;

  /** Código opcional de referencia interna. Puede quedar vacío. */
  optionalCode?: string;

  /** "Tipo Faena" → Labor Agrícola, Aplicaciones, Cosecha… */
  workType: WorkType;

  /** Dónde se habilita ("Usar en:"). */
  usageScope: UsageScope;

  /** Si la faena requiere calibración por hectárea ("Utiliza Calibración Ha"). */
  usesCalibrationPerHa: boolean;

  /** Lista de predios (farms / ranches) donde está permitida ("Disponible en Predio"). */
  allowedFarms: string[];

  /** Marca de tiempo opcional para auditoría. */
  createdAt?: Date;
  updatedAt?: Date;
} 