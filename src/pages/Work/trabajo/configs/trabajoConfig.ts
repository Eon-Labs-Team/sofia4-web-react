/**
 * Configuración específica para trabajos de tipo T (Trabajo Agrícola)
 */

import { z } from "zod";
import { Wrench } from "lucide-react";
import type { WorkTypeConfig } from "../../shared/types/workTypes";
import type { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import type { Column } from "@/lib/store/gridStore";

/**
 * Configuración específica para trabajos de tipo T (Trabajo Agrícola)
 */

// Secciones del formulario para trabajo 
export const trabajoFormSections: SectionConfig[] = [
  {
    id: "aplicacion-info-basic",
    title: "Información Básica",
    description: "Datos principales de la aplicación",
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
        required: true
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
      },
    ],
  },
  {
    id: "trabajo-info-detail",
    title: "Detalles Generales",
    description: "Información general del trabajo",
    fields: [
      {
        id: "hectares",
        type: "number",
        label: "Hectáreas",
        name: "hectares",
        disabled: true,
        required: true
      },
      {
        id: "coverage",
        type: "select",
        label: "Cobertura",
        name: "coverage",
        required: true,
        options: [
          { value: "stripping", label: "Desmanche" },
          { value: "between rows", label: "Entre hilera" },
          { value: "over rows", label: "Sobre hilera" },
          { value: "total", label: "Total" }
        ]
      },
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
      },
    ],
  },
  {
    id: "trabajo-specific-data",
    title: "Información Específica del Trabajo",
    description: "Datos específicos para trabajos agrícolas (Tipo T)",
    fields: [
      {
        id: "workCategory",
        type: "select",
        label: "Categoría del Trabajo",
        name: "specificData.workCategory",
        placeholder: "Seleccione la categoría",
        required: true,
        options: [
          { value: "poda", label: "Poda" },
          { value: "riego", label: "Riego" },
          { value: "fertilizacion", label: "Fertilización" },
          { value: "control_malezas", label: "Control de Malezas" },
          { value: "mantenimiento", label: "Mantenimiento" },
          { value: "otros", label: "Otros" }
        ]
      },
      {
        id: "toolsUsed",
        type: "text",
        label: "Herramientas Utilizadas",
        name: "specificData.toolsUsed",
        placeholder: "Ej: Tijeras de poda, rastrillos, azadones (separados por coma)"
      },
      {
        id: "technique",
        type: "text",
        label: "Técnica Empleada",
        name: "specificData.technique",
        placeholder: "Descripción de la técnica utilizada"
      },
      {
        id: "intensity",
        type: "select",
        label: "Intensidad del Trabajo",
        name: "specificData.intensity",
        placeholder: "Seleccione la intensidad",
        options: [
          { value: "ligero", label: "Ligero" },
          { value: "moderado", label: "Moderado" },
          { value: "intenso", label: "Intenso" }
        ]
      },
      {
        id: "soilCondition",
        type: "text",
        label: "Condición del Suelo",
        name: "specificData.soilCondition",
        placeholder: "Ej: Húmedo, seco, compactado"
      },
      {
        id: "additionalNotes",
        type: "textarea",
        label: "Notas Adicionales",
        name: "specificData.additionalNotes",
        placeholder: "Observaciones específicas del trabajo agrícola"
      },
    ],
  },
  {
    id: "aplicacion-info-task",
    title: "Información de Tarea",
    description: "Definición de la tarea a realizar",
    fields: [
      {
        id: "taskType",
        type: "select",
        label: "Faena",
        name: "taskType",
        placeholder: "Seleccione una faena",
        required: true
      },
      {
        id: "task",
        type: "select",
        label: "Labor",
        name: "task",
        placeholder: "Seleccione una labor",
        required: true
      },
      {
        id: "customTask",
        type: "text",
        label: "Tarea Personalizada",
        name: "customTask",
        placeholder: "Tarea personalizada"
      },
      {
        id: "workState",
        type: "select",
        label: "Estado de la Aplicación",
        name: "workState",
        defaultValue: "pending",
        options: [
          { value: "confirmed", label: "Confirmada" },
          { value: "pending", label: "Pendiente" },
          { value: "void", label: "Nula" },
          { value: "blocked", label: "Bloqueada" }
        ]
      },
    ],
  },
  {
    id: "aplicacion-info-payment",
    title: "Información de Pago",
    description: "Configuración de pagos para trabajadores",
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
        defaultValue: "trato",
        options:[
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
      },
    ],
  },
  {
    id: "trabajo-info-dates",
    title: "Fechas y Horas",
    description: "Programación temporal del trabajo",
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
    ],
  },
  {
    id: "aplicacion-info-climate",
    title: "Condiciones Climáticas",
    description: "Condiciones ambientales para la aplicación",
    fields: [
      {
        id: "climateConditions",
        type: "select",
        label: "Condiciones Climáticas",
        name: "climateConditions",
        placeholder: "Seleccione condición climática"
      },
      {
        id: "windSpeed",
        type: "select",
        label: "Velocidad del Viento",
        name: "windSpeed",
        placeholder: "Seleccione velocidad del viento"
      },
      {
        id: "temperature",
        type: "text",
        label: "Temperatura (°C)",
        name: "temperature",
        placeholder: "Temperatura"
      },
      {
        id: "humidity",
        type: "text",
        label: "Humedad (%)",
        name: "humidity",
        placeholder: "Humedad"
      },
    ],
  },
  {
    id: "aplicacion-info-app",
    title: "Información para App",
    description: "Configuración de sincronización móvil",
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
    ],
  },
  {
    id: "trabajo-info-responsibles",
    title: "Responsables",
    description: "Asignación de roles y responsabilidades",
    fields: [
      {
        id: "responsibles.supervisor.userId",
        type: "select",
        label: "Supervisor",
        name: "responsibles.supervisor.userId",
        placeholder: "Seleccione un supervisor"
      },
      {
        id: "responsibles.planner.userId",
        type: "select",
        label: "Planificador",
        name: "responsibles.planner.userId",
        placeholder: "Seleccione un planificador"
      },
      {
        id: "responsibles.technicalVerifier.userId",
        type: "select",
        label: "Verificador Técnico",
        name: "responsibles.technicalVerifier.userId",
        placeholder: "Seleccione un verificador técnico"
      },
    ],
  }
];

// Columnas del grid para trabajo
export const trabajoGridColumns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: false,
    sortable: true,
  },
  {
    id: "orderNumber",
    header: "Número de Orden",
    accessor: "orderNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "executionDate",
    header: "Fecha de Ejecución",
    accessor: "executionDate",
    visible: true,
    sortable: true,
    groupable: true,
    render: (value: string) => {
      return value ? new Date(value).toLocaleDateString() : '';
    }
  },
  {
    id: "barracks",
    header: "Cuartel",
    accessor: "barracks",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "species",
    header: "Especie",
    accessor: "species",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "phenologicalState",
    header: "Estado Fenológico",
    accessor: "phenologicalState",
    visible: true,
    sortable: true,
  },
  {
    id: "hectares",
    header: "Hectáreas",
    accessor: "hectares",
    visible: true,
    sortable: true,
  },
  // {
  //   id: "appliedHectares",
  //   header: "Hectáreas Aplicadas",
  //   accessor: "appliedHectares",
  //   visible: true,
  //   sortable: true,
  // },
  {
    id: "generalObjective",
    header: "Objetivo General",
    accessor: "generalObjective",
    visible: true,
    sortable: true,
  },
  {
    id: "taskType",
    header: "Faena",
    accessor: "taskType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "task",
    header: "Labor",
    accessor: "task",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workState",
    header: "Estado",
    accessor: "workState",
    visible: true,
    sortable: true,
    groupable: true,
  }
];

// Esquema de validación para trabajo
export const trabajoValidationSchema = z.object({
  workType: z.string().default("T"),
  orderNumber: z.string({ invalid_type_error: "El número de orden debe ser texto" }).min(1, { message: "El número de orden es obligatorio" }),
  executionDate: z.string({ invalid_type_error: "La fecha debe ser una fecha válida" }),
  barracks: z.string({ invalid_type_error: "El cuartel debe ser texto" }).min(1, { message: "El cuartel es obligatorio" }),
  species: z.string({ invalid_type_error: "La especie debe ser texto" }).min(1, { message: "La especie es obligatoria" }),
  variety: z.string({ invalid_type_error: "La variedad debe ser texto" }).min(1, { message: "La variedad es obligatoria" }),
  phenologicalState: z.string({ invalid_type_error: "El estado fenológico debe ser texto" }).min(1, { message: "El estado fenológico es obligatorio" }),
  hectares: z.number({ invalid_type_error: "Las hectáreas deben ser un número" }).min(0, { message: "Las hectáreas no pueden ser negativas" }),
  coverage: z.string({ invalid_type_error: "La cobertura debe ser texto" }).min(1, { message: "La cobertura es obligatoria" }),
  observation: z.string({ invalid_type_error: "La observación debe ser texto" }).optional(),
  observationApp: z.string({ invalid_type_error: "La observación de app debe ser texto" }).optional(),
  startDate: z.string({ invalid_type_error: "La fecha de inicio debe ser texto" }).optional(),
  hourStartDate: z.string({ invalid_type_error: "La hora de inicio debe ser texto" }).optional(),
  endDate: z.string({ invalid_type_error: "La fecha de fin debe ser texto" }).optional(),
  hourEndDate: z.string({ invalid_type_error: "La hora de fin debe ser texto" }).optional(),
  climateConditions: z.string({ invalid_type_error: "Las condiciones climáticas deben ser texto" }).optional(),
  windSpeed: z.string({ invalid_type_error: "La velocidad del viento debe ser texto" }).optional(),
  temperature: z.string({ invalid_type_error: "La temperatura debe ser texto" }).optional(),
  humidity: z.string({ invalid_type_error: "La humedad debe ser texto" }).optional(),
  syncApp: z.boolean({ invalid_type_error: "El campo syncApp debe ser verdadero o falso" }).default(false),
  appUser: z.string({ invalid_type_error: "El usuario de la app debe ser texto" }).optional(),
  workState: z.string({ invalid_type_error: "El estado del trabajo debe ser texto" }).default("pending"),

  // Task related fields
  taskType: z.string({ invalid_type_error: "Debe seleccionar una faena" }).min(1, { message: "La faena es obligatoria" }),
  task: z.union([
    z.string().min(1, { message: "Debe seleccionar una labor" }),
    z.object({
      id: z.string(),
      optionalCode: z.string().optional(),
      taskName: z.string().optional(),
      taskPrice: z.number().optional(),
      optimalYield: z.number().optional(),
      isEditableInApp: z.boolean().optional(),
      usesWetCalculationPerHa: z.boolean().optional(),
      usageContext: z.string().optional(),
      maxHarvestYield: z.number().optional(),
      showTotalEarningsInApp: z.boolean().optional(),
      associatedProducts: z.array(z.any()).optional(),
      requiresRowCount: z.boolean().optional(),
      requiresHourLog: z.boolean().optional()
    })
  ]),
  customTask: z.string().optional(),

  // Payment related fields
  taskOptimalYield: z.number().optional(),
  initialBonusToWorkers: z.number().optional(),
  paymentMethodToWorkers: z.string().optional(),
  taskPrice: z.number().optional(),

  // Responsibles validation (sin applicators para trabajos agrícolas)
  responsibles: z.object({
    supervisor: z.object({
      userId: z.string().optional(),
      name: z.string().optional()
    }).optional(),
    planner: z.object({
      userId: z.string().optional(),
      name: z.string().optional()
    }).optional(),
    technicalVerifier: z.object({
      userId: z.string().optional(),
      name: z.string().optional()
    }).optional()
  }).optional(),

  // Specific data for Agricultural Work type (T)
  specificData: z.object({
    workCategory: z.string({ invalid_type_error: "La categoría del trabajo debe ser texto" }).min(1, { message: "La categoría del trabajo es obligatoria" }),
    toolsUsed: z.string().optional(),
    technique: z.string().optional(),
    intensity: z.string().optional(),
    soilCondition: z.string().optional(),
    additionalNotes: z.string().optional()
  }).optional()
});

// Valores por defecto para trabajo
export const trabajoDefaultValues = {
  workType: "T",
  coverage: "total",
  paymentMethodToWorkers: "trato",
  workState: "pending",
  syncApp: false
};

// Configuración completa para tipo A
export const trabajoConfig: WorkTypeConfig = {
  workType: "T",
  title: "Trabajos agrícolas",
  description: "Gestión de labores agrícolas generales y mantenimiento de cultivos",
  icon: Wrench,
  
  formSections: trabajoFormSections,
  defaultValues: trabajoDefaultValues,
  validationSchema: trabajoValidationSchema,
  
  gridColumns: trabajoGridColumns,
  
  features: {
    requiresProducts: true,
    requiresWeather: true,
    requiresPPE: true,
    requiresWashing: true,
    requiresHarvest: false,
    requiresYield: false,
    requiresQuality: false,
  }
};
