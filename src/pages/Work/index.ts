/**
 * Sistema de Gestión de Trabajos Agrícolas
 * 
 * Este módulo proporciona un sistema desacoplado para gestionar diferentes tipos
 * de trabajos agrícolas: Aplicaciones (A), Cosecha (C), y Trabajo Agrícola (T).
 * 
 * Arquitectura:
 * - WorkManager: Componente orquestador principal
 * - shared/: Lógica y componentes reutilizables
 * - aplicacion/, cosecha/, trabajo/: Configuraciones específicas por tipo
 */

// Componente principal
export { default as WorkManager } from './WorkManager';

// Componentes base reutilizables
export { default as BaseWorkGrid } from './shared/components/BaseWorkGrid';
export { default as BaseWorkForm } from './shared/components/BaseWorkForm';

// Hooks compartidos
export { useWorkData } from './shared/hooks/useWorkData';

// Tipos y configuraciones
export * from './shared/types/workTypes';

// Configuraciones específicas por tipo
export { aplicacionConfig } from './aplicacion/configs/aplicacionConfig';
export { cosechaConfig } from './cosecha/configs/cosechaConfig';
export { trabajoConfig } from './trabajo/configs/trabajoConfig';

// Re-export para compatibilidad con el componente anterior
export { default as OrdenAplicacion } from './WorkManager';