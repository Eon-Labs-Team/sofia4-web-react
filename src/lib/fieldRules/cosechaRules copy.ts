import { FormGridRules } from "@/lib/validationSchemas";

/**
 * Reglas de campos para cosecha
 * 
 * Este archivo define las reglas de reactividad entre campos para los formularios
 * de cosecha, tanto para el wizard como para el formulario principal.
 */

export const cosechaRules: FormGridRules = {
  rules: [
    // Regla 1: Cuando se selecciona un cuartel, actualizar la especie (buscar nombre del cropType)
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'calculate',
        targetField: 'species',
        calculate: (formData, _parentData, externalData) => {
          const barracksId = formData.barracks;
          
          // Buscar el cuartel seleccionado
          const selectedCuartel = externalData?.cuartelesOptions?.find((cuartel: any) => 
            cuartel._id === barracksId
          );
          
          if (!selectedCuartel?.varietySpecies) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 No varietySpecies found for selected cuartel:', barracksId);
            }
            return '';
          }
          
          // Buscar el nombre del cropType usando el varietySpecies ID
          const cropType = externalData?.cropTypesOptions?.find((crop: any) => 
            crop._id === selectedCuartel.varietySpecies
          );
          
          const speciesName = cropType?.cropName || selectedCuartel.varietySpecies;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🌱 Species lookup result:', {
              barracksId,
              varietySpeciesId: selectedCuartel.varietySpecies,
              speciesName
            });
          }
          
          return speciesName;
        }
      }
    },
    
    // Regla 2: Cuando se selecciona un cuartel, actualizar la variedad (buscar nombre del varietyType)
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'calculate',
        targetField: 'variety',
        calculate: (formData, _parentData, externalData) => {
          const barracksId = formData.barracks;
          
          // Buscar el cuartel seleccionado
          const selectedCuartel = externalData?.cuartelesOptions?.find((cuartel: any) => 
            cuartel._id === barracksId
          );
          
          if (!selectedCuartel?.variety) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 No variety found for selected cuartel:', barracksId);
            }
            return '';
          }
          
          // Buscar el nombre del varietyType usando el variety ID
          const varietyType = externalData?.varietyTypesOptions?.find((variety: any) => 
            variety._id === selectedCuartel.variety
          );
          
          const varietyName = varietyType?.varietyName || selectedCuartel.variety;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🍇 Variety lookup result:', {
              barracksId,
              varietyId: selectedCuartel.variety,
              varietyName
            });
          }
          
          return varietyName;
        }
      }
    },

    // Regla 3: Cuando se selecciona un cuartel, autocompletar hectares con totalHa del cuartel
    {
      trigger: { 
        field: 'barracks',
        condition: (value) => value !== null && value !== undefined && value !== ''
      },
      action: {
        type: 'calculate',
        targetField: 'hectares',
        calculate: (formData, _parentData, externalData) => {
          const barracksId = formData.barracks;
          
          // Buscar el cuartel seleccionado
          const selectedCuartel = externalData?.cuartelesOptions?.find((cuartel: any) => 
            cuartel._id === barracksId
          );
          
          if (!selectedCuartel?.totalHa) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 No totalHa found for selected cuartel:', barracksId);
            }
            return 1;
          }
          
          const totalHectares = parseInt(selectedCuartel.totalHa) || 0;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📏 Hectares lookup result:', {
              barracksId,
              totalHa: selectedCuartel.totalHa,
              hectaresValue: totalHectares
            });
          }
          
          return totalHectares;
        }
      }
    },

    // Regla 4: Limpiar especie cuando se deselecciona el cuartel
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

    // Regla 5: Limpiar variedad cuando se deselecciona el cuartel
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

    // Regla 6: Limpiar hectares cuando se deselecciona el cuartel
    {
      trigger: {
        field: 'barracks',
        condition: (value) => value === null || value === undefined || value === ''
      },
      action: {
        type: 'preset',
        targetField: 'hectares',
        preset: () => 0
      }
    },

    // Regla 7: Autocompletar taskType basado en la tarea seleccionada
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

    // Regla 8: Calcular hectáreas aplicadas basado en cobertura (con debouncing)
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

    // Regla 9: Calcular hectáreas aplicadas basado en hectáreas totales (con debouncing)
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

    // Regla 10: Cuando cambia taskType, filtrar tasks disponibles y limpiar selección actual si no aplica
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

    // Regla 11: Cuando se selecciona task, establecer automáticamente su taskType
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

    // Regla 12: Limpiar taskType cuando se deselecciona task (opcional)
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

    // Regla 13: Supervisor - establecer name cuando cambia userId
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

    // Regla 14: Planner - establecer name cuando cambia userId
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

    // Regla 15: Technical Verifier - establecer name cuando cambia userId
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

    // Regla 16: Applicator - establecer name cuando cambia userId
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
    workerOptions: [],   // Array de workers con _id, fullName
    cropTypesOptions: [], // Array de crop types con _id, cropName
    varietyTypesOptions: [] // Array de variety types con _id, varietyName
  }
};

/**
 * Función helper para crear reglas con datos externos actualizados
 */
export const createCosechaRules = (externalData: {
  cuartelesOptions?: any[];
  taskOptions?: any[];
  taskTypeOptions?: any[];
  workerOptions?: any[];
  cropTypesOptions?: any[];
  varietyTypesOptions?: any[];
}): FormGridRules => {
  return {
    ...cosechaRules,
    externalData: {
      ...cosechaRules.externalData,
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