import { FormGridRules } from "@/lib/validationSchemas";

/**
 * Reglas de campos para Orden de Aplicación
 * 
 * Este archivo define las reglas de reactividad entre campos para los formularios
 * de orden de aplicación, tanto para el wizard como para el formulario principal.
 */

export const ordenAplicacionRules: FormGridRules = {
  rules: [
    // Regla 1: Cuando se selecciona un cuartel, actualizar la especie
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'cuartelesOptions',
        lookupField: '_id',
        targetField: 'species',
        mappingField: 'varietySpecies'
      }
    },
    
    // Regla 2: Cuando se selecciona un cuartel, actualizar la variedad
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'cuartelesOptions',
        lookupField: '_id',
        targetField: 'variety',
        mappingField: 'variety'
      }
    },

    // Regla 3: Limpiar especie y variedad cuando se deselecciona el cuartel
    {
      trigger: {
        field: 'barracks',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'species',
        preset: () => ''
      }
    },

    // Regla 4: Limpiar variedad cuando se deselecciona el cuartel
    {
      trigger: {
        field: 'barracks',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'variety',
        preset: () => ''
      }
    },

    // Regla 5: Autocompletar taskType basado en la tarea seleccionada
    {
      trigger: { 
        field: 'task',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'taskOptions',
        lookupField: '_id',
        targetField: 'taskType',
        mappingField: 'taskType'
      }
    },

    // Regla 6: Calcular hectáreas aplicadas basado en cobertura (con debouncing)
    {
      trigger: { 
        field: 'coverage',
        debounce: 300 // Debounce para campos numéricos que cambian frecuentemente
      },
      action: {
        type: 'calculate',
        targetField: 'appliedHectares',
        calculate: (formData) => {
          const hectares = parseFloat(formData.hectares) || 0;
          const coverage = parseFloat(formData.coverage) || 100;
          return (hectares * coverage / 100).toFixed(2);
        }
      }
    },

    // Regla 7: Calcular hectáreas aplicadas basado en hectáreas totales (con debouncing)
    {
      trigger: { 
        field: 'hectares',
        debounce: 300 // Debounce para campos numéricos que cambian frecuentemente
      },
      action: {
        type: 'calculate',
        targetField: 'appliedHectares',
        calculate: (formData) => {
          const hectares = parseFloat(formData.hectares) || 0;
          const coverage = parseFloat(formData.coverage) || 100;
          return (hectares * coverage / 100).toFixed(2);
        }
      }
    },

    // =====================================
    // REGLAS PARA TASKTYPE Y TASK
    // =====================================

    // Regla 8: Cuando cambia taskType, filtrar tasks disponibles y limpiar selección actual si no aplica
    {
      trigger: { 
        field: 'taskType',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'filterOptions',
        targetField: 'task',
        filterListKey: 'taskOptions',
        filterByField: 'taskTypeId',
      }
    },

    // Regla 8b: Limpiar task actual si no pertenece al nuevo taskType
    {
      trigger: { 
        field: 'taskType',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'preset',
        targetField: 'task',
        preset: (formData, _parentData, externalData) => {
          const taskTypeId = formData.taskType;
          const currentTaskId = formData.task;
          
          if (!currentTaskId) return formData.task; // No hay task seleccionada
          
          // Buscar la task actual en la lista
          const currentTask = externalData?.taskOptions?.find((task: any) => 
            (task._id === currentTaskId || task.id === currentTaskId)
          );
          
          // Si la task actual no pertenece al nuevo taskType, limpiarla
          if (currentTask && currentTask.taskTypeId !== taskTypeId) {
            // Solo log en modo debug
            if (process.env.NODE_ENV === 'development') {
              console.log('🚨 Task cleared - it belonged to different faena:', {
                taskName: currentTask.taskName,
                oldTaskTypeId: currentTask.taskTypeId,
                newTaskTypeId: taskTypeId
              });
            }
            return '';
          }
          
          // Mantener la task actual si pertenece al taskType
          return formData.task;
        }
      }
    },

    // Regla 8c: Cuando se deselecciona taskType, mostrar todas las tasks
    {
      trigger: { 
        field: 'taskType',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'filterOptions',
        targetField: 'task',
        filterListKey: 'taskOptions',
        filterFunction: (allTasks) => {
          // Cuando no hay taskType seleccionado, mostrar todas las tasks
          if (process.env.NODE_ENV === 'development') {
            console.log('📂 Showing all tasks (no faena selected):', allTasks.length);
          }
          return [...allTasks];
        }
      }
    },

    // Regla 9: Cuando se selecciona task, establecer automáticamente su taskType
    {
      trigger: { 
        field: 'task',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'taskOptions',
        lookupField: '_id',
        targetField: 'taskType',
        mappingField: 'taskTypeId'
      }
    },

    // Regla 10: Limpiar taskType cuando se deselecciona task (opcional)
    {
      trigger: {
        field: 'task',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'taskType',
        preset: () => '' // O mantener el taskType actual, depende del comportamiento deseado
      }
    },

    // =====================================
    // REGLAS PARA RESPONSIBLES
    // =====================================

    // Regla 11: Supervisor - establecer name cuando cambia userId
    {
      trigger: { field: 'responsibles.supervisor.userId' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'workerOptions',
        lookupField: '_id',
        targetField: 'responsibles.supervisor.name',
        mappingField: 'fullName'
      }
    },

    // Regla 12: Planner - establecer name cuando cambia userId
    {
      trigger: { field: 'responsibles.planner.userId' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'workerOptions',
        lookupField: '_id',
        targetField: 'responsibles.planner.name',
        mappingField: 'fullName'
      }
    },

    // Regla 13: Technical Verifier - establecer name cuando cambia userId
    {
      trigger: { field: 'responsibles.technicalVerifier.userId' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'workerOptions',
        lookupField: '_id',
        targetField: 'responsibles.technicalVerifier.name',
        mappingField: 'fullName'
      }
    },

    // Regla 14: Applicator - establecer name cuando cambia userId
    {
      trigger: { field: 'responsibles.applicators.0.userId' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'workerOptions',
        lookupField: '_id',
        targetField: 'responsibles.applicators.0.name',
        mappingField: 'fullName'
      }
    }
  ],
  
  // Los datos externos se establecerán dinámicamente cuando se use el sistema
  externalData: {
    cuartelesOptions: [], // Array de cuarteles con _id, varietySpecies, variety
    taskOptions: [],     // Array de tareas con _id, taskTypeId, taskName
    taskTypeOptions: [], // Array de tipos de tarea
    workerOptions: []    // Array de workers con _id, fullName
  }
};

/**
 * Función helper para crear reglas con datos externos actualizados
 */
export const createOrdenAplicacionRules = (externalData: {
  cuartelesOptions?: any[];
  taskOptions?: any[];
  taskTypeOptions?: any[];
  workerOptions?: any[];
}): FormGridRules => {
  return {
    ...ordenAplicacionRules,
    externalData: {
      ...ordenAplicacionRules.externalData,
      ...externalData
    }
  };
};

/**
 * Tipos para las opciones externas
 */
export interface CuartelOption {
  _id: string;
  areaName: string;
  varietySpecies?: string;
  variety?: string;
}

export interface TaskOption {
  _id: string;
  name: string;
  taskType: string;
}

export interface TaskTypeOption {
  _id: string;
  name: string;
}

export interface WorkerOption {
  _id: string;
  names: string;
  lastName: string;
  rut: string;
  fullName: string; // computed field: `${names} ${lastName}`
}