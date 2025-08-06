import React, { useMemo } from "react";
import { Wizard } from "./index";
import { WizardStepConfig } from "./types";
import { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { createOrdenAplicacionRules } from "@/lib/fieldRules/ordenAplicacionRules";

interface WizardOrdenAplicacionProps {
  onComplete: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  // Raw data arrays like in the main form
  cuarteles?: any[];
  allTasks?: any[];
  taskTypes?: any[];
  workerList?: any[];
  // Legacy prop support (optional)
  cuartelesOptions?: { value: string; label: string }[];
  taskTypeOptions?: { value: string; label: string }[];
  taskOptions?: { value: string; label: string }[];
  supervisorOptions?: { value: string; label: string }[];
  plannerOptions?: { value: string; label: string }[];
  verifierOptions?: { value: string; label: string }[];
  applicatorOptions?: { value: string; label: string }[];
}

const WizardOrdenAplicacion: React.FC<WizardOrdenAplicacionProps> = ({
  onComplete,
  onCancel,
  defaultValues = {},
  // Raw data arrays (preferred)
  cuarteles = [],
  allTasks = [],
  taskTypes = [],
  workerList = [],
  // Legacy options (fallback)
  cuartelesOptions = [],
  taskTypeOptions = [],
  taskOptions = [],
  supervisorOptions = [],
  plannerOptions = [],
  verifierOptions = [],
  applicatorOptions = [],
}) => {
  // Crear reglas de reactividad para el wizard - igual que el formulario principal
  const wizardRules = useMemo(() => {
    // Use raw data arrays if available, otherwise fall back to legacy options
    const cuartelesData = cuarteles.length > 0 ? cuarteles : cuartelesOptions.map(option => ({
      _id: option.value,
      areaName: option.label,
      varietySpecies: (option as any).varietySpecies,
      variety: (option as any).variety
    }));
    
    const tasksData = allTasks.length > 0 ? allTasks : taskOptions.map(option => ({
      _id: option.value,
      taskName: option.label,
      taskTypeId: (option as any).taskTypeId
    }));
    
    const taskTypesData = taskTypes.length > 0 ? taskTypes : taskTypeOptions;
    
    const workersData = workerList.length > 0 
      ? workerList.map(worker => ({
          ...worker,
          fullName: `${worker.names} ${worker.lastName}`
        }))
      : [
          ...supervisorOptions,
          ...plannerOptions,
          ...verifierOptions,
          ...applicatorOptions
        ].reduce((acc: any[], current) => {
          // Evitar duplicados usando _id
          if (!acc.find(item => item._id === current.value)) {
            acc.push({
              _id: current.value,
              fullName: current.label,
              names: current.label.split(' ')[0] || '',
              lastName: current.label.split(' ').slice(1).join(' ') || ''
            });
          }
          return acc;
        }, []);

    return createOrdenAplicacionRules({
      cuartelesOptions: cuartelesData,
      taskOptions: tasksData,
      taskTypeOptions: taskTypesData,
      workerOptions: workersData
    });
  }, [cuarteles, allTasks, taskTypes, workerList, cuartelesOptions, taskOptions, taskTypeOptions, supervisorOptions, plannerOptions, verifierOptions, applicatorOptions]);

  // Generate options for form fields - prioritize raw data arrays
  const getFormOptions = useMemo(() => {
    const cuartelesFormOptions = cuarteles.length > 0 
      ? cuarteles.map(cuartel => ({
          value: cuartel._id,
          label: cuartel.areaName
        }))
      : cuartelesOptions;
      
    const taskTypeFormOptions = taskTypes.length > 0
      ? taskTypes.map(taskType => ({
          value: taskType._id || taskType.id,
          label: taskType.name
        }))
      : taskTypeOptions;
      
    const taskFormOptions = allTasks.length > 0
      ? allTasks.map(task => ({
          value: (task as any)._id || (task as any).id,
          label: task.taskName
        }))
      : taskOptions;
      
    const workerFormOptions = workerList.length > 0
      ? workerList.map(worker => ({
          value: worker._id || "",
          label: `${worker.names} ${worker.lastName} (${worker.rut})`
        }))
      : [...supervisorOptions, ...plannerOptions, ...verifierOptions, ...applicatorOptions]
          .reduce((acc: any[], current) => {
            if (!acc.find(item => item.value === current.value)) {
              acc.push(current);
            }
            return acc;
          }, []);
    
    return {
      cuarteles: cuartelesFormOptions,
      taskTypes: taskTypeFormOptions,
      tasks: taskFormOptions,
      workers: workerFormOptions
    };
  }, [cuarteles, allTasks, taskTypes, workerList, cuartelesOptions, taskTypeOptions, taskOptions, supervisorOptions, plannerOptions, verifierOptions, applicatorOptions]);

  // Paso 1: Información Básica y Ubicación
  const step1Sections: SectionConfig[] = [
    {
      id: "basic-info",
      title: "",
      description: "",
      fields: [
        {
          id: "orderNumber",
          type: "text",
          label: "Número de Orden",
          name: "orderNumber",
          placeholder: "Número de la orden",
          required: true
        },
        {
          id: "executionDate",
          type: "date",
          label: "Fecha de Ejecución",
          name: "executionDate",
          required: true
        },
        {
          id: "barracks",
          type: "select",
          label: "Cuartel",
          name: "barracks",
          placeholder: "Seleccione un cuartel",
          required: true,
          options: getFormOptions.cuarteles
        },
        {
          id: "species",
          type: "text",
          label: "Especie",
          name: "species",
          placeholder: "Se llenará automáticamente al seleccionar cuartel",
          required: true,
          disabled: true
        },
        {
          id: "variety",
          type: "text",
          label: "Variedad",
          name: "variety",
          placeholder: "Se llenará automáticamente al seleccionar cuartel",
          required: true,
          disabled: true
        },
        {
          id: "phenologicalState",
          type: "text",
          label: "Estado Fenológico",
          name: "phenologicalState",
          placeholder: "Ej: Floración, Maduración, Cosecha",
          required: true
        }
      ]
    }
  ];

  // Paso 2: Detalles de Aplicación y Tarea
  const step2Sections: SectionConfig[] = [
    {
      id: "application-details",
      title: "Detalles de Aplicación",
      description: "Información específica sobre la aplicación a realizar",
      fields: [
        {
          id: "hectares",
          type: "number",
          label: "Hectáreas",
          name: "hectares",
          required: true
        },
        {
          id: "appliedHectares",
          type: "number",
          label: "Hectáreas Aplicadas",
          name: "appliedHectares",
          required: true
        },
        {
          id: "coverage",
          type: "number",
          label: "Cobertura",
          name: "coverage",
          required: true
        },
        {
          id: "generalObjective",
          type: "text",
          label: "Objetivo General",
          name: "generalObjective",
          placeholder: "Objetivo de la aplicación",
          required: true
        }
      ]
    },
    {
      id: "task-info",
      title: "Información de Tarea",
      description: "Selección de faena y labor a realizar",
      fields: [
        {
          id: "taskType",
          type: "select",
          label: "Faena",
          name: "taskType",
          placeholder: "Seleccione una faena",
          options: getFormOptions.taskTypes
        },
        {
          id: "task",
          type: "select",
          label: "Labor",
          name: "task",
          placeholder: "Seleccione una labor",
          options: getFormOptions.tasks
        },
        {
          id: "customTask",
          type: "text",
          label: "Tarea Personalizada",
          name: "customTask",
          placeholder: "Tarea personalizada"
        },
        {
          id: "calibrationPerHectare",
          type: "number",
          label: "Calibración por Hectárea",
          name: "calibrationPerHectare",
          placeholder: "Calibración por hectárea"
        }
      ]
    }
  ];

  // Paso 3: Responsables y Pagos
  const step3Sections: SectionConfig[] = [
    {
      id: "responsibles",
      title: "Responsables",
      description: "Asignación de personal responsable",
      fields: [
        {
          id: "responsibles.supervisor.userId",
          type: "select",
          label: "Supervisor",
          name: "responsibles.supervisor.userId",
          placeholder: "Seleccione un supervisor",
          options: getFormOptions.workers
        },
        {
          id: "responsibles.planner.userId",
          type: "select",
          label: "Planificador",
          name: "responsibles.planner.userId",
          placeholder: "Seleccione un planificador",
          options: getFormOptions.workers
        },
        {
          id: "responsibles.technicalVerifier.userId",
          type: "select",
          label: "Verificador Técnico",
          name: "responsibles.technicalVerifier.userId",
          placeholder: "Seleccione un verificador técnico",
          options: getFormOptions.workers
        },
        {
          id: "responsibles.applicators.0.userId",
          type: "select",
          label: "Aplicador Principal",
          name: "responsibles.applicators.0.userId",
          placeholder: "Seleccione un aplicador",
          options: getFormOptions.workers
        }
      ]
    },
    {
      id: "payment-info",
      title: "Información de Pago",
      description: "Configuración de pagos y rendimientos",
      fields: [
        {
          id: "taskOptimalYield",
          type: "number",
          label: "Rendimiento Óptimo",
          name: "taskOptimalYield",
          placeholder: "Rendimiento óptimo de la tarea"
        },
        {
          id: "initialBonusToWorkers",
          type: "number",
          label: "Bono Inicial a Trabajadores",
          name: "initialBonusToWorkers",
          placeholder: "Bono inicial a trabajadores"
        },
        {
          id: "paymentMethodToWorkers",
          type: "select",
          label: "Método de Pago a Trabajadores",
          name: "paymentMethodToWorkers",
          placeholder: "Método de pago a trabajadores",
          options: [
            { value: "trato", label: "Trato" },
            { value: "trato-dia", label: "Trato + Día" },
            { value: "dia-laboral", label: "Día laboral" },
            { value: "mayor-trato-dia", label: "Mayor entre trato o día laboral" },
            { value: "trato-dia-laboral", label: "Trato - dia laboral" }
          ]
        },
        {
          id: "taskPrice",
          type: "number",
          label: "Precio de Tarea",
          name: "taskPrice",
          placeholder: "Precio de la tarea"
        }
      ]
    }
  ];

  // Paso 4: Fechas, Horarios y Condiciones
  const step4Sections: SectionConfig[] = [
    {
      id: "dates-times",
      title: "Fechas y Horarios",
      description: "Programación temporal de la aplicación",
      fields: [
        {
          id: "startDate",
          type: "date",
          label: "Fecha de Inicio",
          name: "startDate"
        },
        {
          id: "hourStartDate",
          type: "text",
          label: "Hora de Inicio",
          name: "hourStartDate",
          placeholder: "HH:MM"
        },
        {
          id: "endDate",
          type: "date",
          label: "Fecha de Fin",
          name: "endDate"
        },
        {
          id: "hourEndDate",
          type: "text",
          label: "Hora de Fin",
          name: "hourEndDate",
          placeholder: "HH:MM"
        },
        {
          id: "gracePeriodEndDate",
          type: "date",
          label: "Fecha de Término de Carencia",
          name: "gracePeriodEndDate"
        },
        {
          id: "reEntryDate",
          type: "date",
          label: "Fecha de Reingreso",
          name: "reEntryDate"
        },
        {
          id: "reEntryHour",
          type: "text",
          label: "Hora de Reingreso",
          name: "reEntryHour",
          placeholder: "HH:MM"
        }
      ]
    },
    {
      id: "climate-conditions",
      title: "Condiciones Climáticas",
      description: "Registro de condiciones ambientales",
      fields: [
        {
          id: "climateConditions",
          type: "text",
          label: "Condiciones Climáticas",
          name: "climateConditions",
          placeholder: "Ej: Soleado, Nublado, Lluvioso"
        },
        {
          id: "windSpeed",
          type: "text",
          label: "Velocidad del Viento",
          name: "windSpeed",
          placeholder: "Velocidad del viento"
        },
        {
          id: "temperature",
          type: "text",
          label: "Temperatura",
          name: "temperature",
          placeholder: "Temperatura"
        },
        {
          id: "humidity",
          type: "text",
          label: "Humedad",
          name: "humidity",
          placeholder: "Humedad"
        }
      ]
    }
  ];

  // Paso 5: Configuración Final y Observaciones
  const step5Sections: SectionConfig[] = [
    {
      id: "app-config",
      title: "Configuración de App",
      description: "Configuración para la aplicación móvil",
      fields: [
        {
          id: "syncApp",
          type: "checkbox",
          label: "Sincronizar con App",
          name: "syncApp"
        },
        {
          id: "appUser",
          type: "text",
          label: "Usuario App",
          name: "appUser",
          placeholder: "Usuario de la app"
        },
        {
          id: "workState",
          type: "select",
          label: "Estado de la Faena",
          name: "workState",
          options: [
            { value: "confirmed", label: "Confirmada" },
            { value: "pending", label: "Pendiente" },
            { value: "void", label: "Nula" },
            { value: "blocked", label: "Bloqueada" }
          ]
        }
      ]
    },
    {
      id: "observations",
      title: "Observaciones",
      description: "Notas adicionales sobre la orden",
      fields: [
        {
          id: "observation",
          type: "textarea",
          label: "Observación",
          name: "observation",
          placeholder: "Observaciones adicionales"
        },
        {
          id: "observationApp",
          type: "textarea",
          label: "Observación desde App",
          name: "observationApp",
          placeholder: "Observaciones desde la aplicación móvil"
        }
      ]
    }
  ];

  // Configuración de los pasos del wizard
  const wizardSteps: WizardStepConfig[] = [
    {
      id: "basic-location",
      title: "Información Básica",
      description: "Datos fundamentales y ubicación",
      sections: step1Sections
    },
    {
      id: "application-task",
      title: "Aplicación y Tarea",
      description: "Detalles de la aplicación y tarea a realizar",
      sections: step2Sections
    },
    {
      id: "responsibles-payment",
      title: "Responsables y Pagos",
      description: "Asignación de personal y configuración de pagos",
      sections: step3Sections
    },
    {
      id: "timing-conditions",
      title: "Fechas y Condiciones",
      description: "Programación temporal y condiciones climáticas",
      sections: step4Sections,
      isOptional: true
    },
    {
      id: "final-config",
      title: "Configuración Final",
      description: "Configuración de app y observaciones",
      sections: step5Sections,
      isOptional: true
    }
  ];

  return (
    <Wizard
      title=""
      description=""
      steps={wizardSteps}
      onComplete={onComplete}
      onCancel={onCancel}
      defaultValues={defaultValues}
      fieldRules={wizardRules}
      showProgress={true}
      allowSkipOptional={true}
      submitButtonText="Crear Orden"
      cancelButtonText="Cancelar"
      nextButtonText="Siguiente"
      previousButtonText="Anterior"
    />
  );
};

export default WizardOrdenAplicacion;