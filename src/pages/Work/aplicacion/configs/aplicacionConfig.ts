import { z } from "zod";
import { TestTubeDiagonal } from "lucide-react";
import type { WorkTypeConfig } from "../../shared/types/workTypes";
import type { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import type { Column } from "@/lib/store/gridStore";

/**
 * Configuración específica para trabajos de tipo A (Aplicación de Productos)
 */

// Secciones del formulario para aplicaciones
export const aplicacionFormSections: SectionConfig[] = [
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
    id: "aplicacion-info-detail",
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
    id: "aplicacion-specific-data",
    title: "Información Específica de la aplicación",
    description: "Datos específicos para aplicaciones de productos (Tipo A)",
    fields: [
      {
        id: "generalObjective",
        type: "text",
        label: "Objetivo General",
        name: "specificData.generalObjective",
        placeholder: "Objetivo de la aplicación",
        required: true
      },
      {
        id: "appliedHectares",
        type: "number",
        label: "Hectáreas Aplicadas",
        name: "specificData.appliedHectares",
        required: true
      },
      {
        id: "calibrationPerHectare",
        type: "number",
        label: "Mojamiento x HA (L/ha)",
        name: "specificData.calibrationPerHectare",
        placeholder: "Mojamiento por hectárea"
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
    id: "aplicacion-info-dates",
    title: "Fechas y Horas",
    description: "Programación temporal de la aplicacion",
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
    id: "aplicacion-specific-dates",
    title: "Fechas Específicas de Aplicación",
    description: "Fechas de carencia y reingreso (específico para aplicaciones)",
    fields: [
      {
        id: "gracePeriodEndDate",
        type: "date",
        label: "Fecha de Término de Carencia",
        name: "specificData.gracePeriodEndDate"
      },
      {
        id: "reEntryDate",
        type: "date",
        label: "Fecha de Reingreso",
        name: "specificData.reEntryDate"
      },
      {
        id: "reEntryHour",
        type: "text",
        label: "Hora de Reingreso",
        name: "specificData.reEntryHour",
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
    id: "aplicacion-info-responsibles",
    title: "Responsables Generales",
    description: "Asignación de roles y responsabilidades comunes",
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
  },
  {
    id: "aplicacion-specific-responsibles",
    title: "Responsables Específicos de Aplicación",
    description: "Aplicadores asignados a esta aplicación de productos",
    fields: [
      {
        id: "specificData.applicators.0.userId",
        type: "select",
        label: "Aplicador Principal",
        name: "specificData.applicators.0.userId",
        placeholder: "Seleccione un aplicador principal"
      },
    ],
  },
  {
    id: "aplicacion-info-ppe",
    title: "Equipo de Protección Personal (EPP)",
    description: "Equipos de seguridad requeridos para la aplicación",
    fields: [
      {
        id: "specificData.ppe.gloves",
        type: "checkbox",
        label: "Guantes",
        name: "specificData.ppe.gloves",
        defaultValue: true
      },
      {
        id: "specificData.ppe.applicatorSuit",
        type: "checkbox",
        label: "Traje de Aplicador",
        name: "specificData.ppe.applicatorSuit",
        defaultValue: true
      },
      {
        id: "specificData.ppe.respirator",
        type: "checkbox",
        label: "Respirador",
        name: "specificData.ppe.respirator",
        defaultValue: true
      },
      {
        id: "specificData.ppe.faceShield",
        type: "checkbox",
        label: "Protector Facial",
        name: "specificData.ppe.faceShield",
        defaultValue: true
      },
      {
        id: "specificData.ppe.apron",
        type: "checkbox",
        label: "Delantal",
        name: "specificData.ppe.apron",
        defaultValue: true
      },
      {
        id: "specificData.ppe.boots",
        type: "checkbox",
        label: "Botas",
        name: "specificData.ppe.boots",
        defaultValue: true
      },
      {
        id: "specificData.ppe.noseMouthProtector",
        type: "checkbox",
        label: "Protector Nariz-Boca",
        name: "specificData.ppe.noseMouthProtector",
        defaultValue: true
      },
      {
        id: "specificData.ppe.others",
        type: "textarea",
        label: "Otros Equipos",
        name: "specificData.ppe.others",
        placeholder: "Otros equipos de protección requeridos"
      },
    ],
  },
  {
    id: "aplicacion-info-washing",
    title: "Protocolo de Lavado",
    description: "Procedimientos de limpieza y descontaminación para aplicaciones",
    fields: [
      {
        id: "specificData.washing.suit1",
        type: "checkbox",
        label: "Traje 1",
        name: "specificData.washing.suit1"
      },
      {
        id: "specificData.washing.suit2",
        type: "checkbox",
        label: "Traje 2",
        name: "specificData.washing.suit2"
      },
      {
        id: "specificData.washing.suit3",
        type: "checkbox",
        label: "Traje 3",
        name: "specificData.washing.suit3"
      },
      {
        id: "specificData.washing.filterHolder1",
        type: "checkbox",
        label: "Porta Filtro 1",
        name: "specificData.washing.filterHolder1"
      },
      {
        id: "specificData.washing.filterHolder2",
        type: "checkbox",
        label: "Porta Filtro 2",
        name: "specificData.washing.filterHolder2"
      },
      {
        id: "specificData.washing.filterHolder3",
        type: "checkbox",
        label: "Porta Filtro 3",
        name: "specificData.washing.filterHolder3"
      },
      {
        id: "specificData.washing.tripleWash",
        type: "checkbox",
        label: "Triple Lavado",
        name: "specificData.washing.tripleWash"
      },
      {
        id: "specificData.washing.machinery",
        type: "checkbox",
        label: "Maquinaria",
        name: "specificData.washing.machinery"
      },
      {
        id: "specificData.washing.leftovers",
        type: "checkbox",
        label: "Sobrantes",
        name: "specificData.washing.leftovers"
      },
      {
        id: "specificData.washing.leftoverObservation",
        type: "checkbox",
        label: "Observación de Sobrantes",
        name: "specificData.washing.leftoverObservation"
      },
    ],
  }
];

// Columnas del grid para aplicaciones
export const aplicacionGridColumns: Column[] = [
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
  {
    id: "appliedHectares",
    header: "Hectáreas Aplicadas",
    accessor: "appliedHectares",
    visible: true,
    sortable: true,
  },
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

// Esquema de validación para aplicaciones
export const aplicacionValidationSchema = z.object({
  workType: z.string().default("A"),
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
    z.string().min(1, { message: "Debe seleccionar una labor" }), // ID del task seleccionado en formulario
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
    }) // Objeto completo que viene de la DB o se envía a la API
  ]),
  customTask: z.string().optional(),

  // Payment related fields
  taskOptimalYield: z.number().optional(),
  initialBonusToWorkers: z.number().optional(),
  paymentMethodToWorkers: z.string().optional(),
  taskPrice: z.number().optional(),

  // Responsibles validation (sin applicators, que ahora va en specificData)
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

  // Specific data for Application type (A)
  specificData: z.object({
    generalObjective: z.string({ invalid_type_error: "El objetivo general debe ser texto" }).min(1, { message: "El objetivo general es obligatorio" }),
    appliedHectares: z.number({ invalid_type_error: "Las hectáreas aplicadas deben ser un número" }).min(0, { message: "Las hectáreas aplicadas no pueden ser negativas" }),
    gracePeriodEndDate: z.string({ invalid_type_error: "La fecha de término de carencia debe ser texto" }).optional(),
    reEntryDate: z.string({ invalid_type_error: "La fecha de reingreso debe ser texto" }).optional(),
    reEntryHour: z.string({ invalid_type_error: "La hora de reingreso debe ser texto" }).optional(),
    calibrationPerHectare: z.number().optional(),
    applicators: z.array(
      z.object({
        userId: z.string().optional(),
        name: z.string().optional()
      })
    ).optional(),
    // PPE validation (dentro de specificData para aplicaciones)
    ppe: z.object({
      gloves: z.boolean().optional().default(false),
      applicatorSuit: z.boolean().optional().default(false),
      respirator: z.boolean().optional().default(false),
      faceShield: z.boolean().optional().default(false),
      apron: z.boolean().optional().default(false),
      boots: z.boolean().optional().default(false),
      noseMouthProtector: z.boolean().optional().default(false),
      others: z.string().optional()
    }).optional(),
    // Washing validation (dentro de specificData para aplicaciones)
    washing: z.object({
      suit1: z.boolean().optional().default(false),
      suit2: z.boolean().optional().default(false),
      suit3: z.boolean().optional().default(false),
      filterHolder1: z.boolean().optional().default(false),
      filterHolder2: z.boolean().optional().default(false),
      filterHolder3: z.boolean().optional().default(false),
      tripleWash: z.boolean().optional().default(false),
      machinery: z.boolean().optional().default(false),
      leftovers: z.boolean().optional().default(false),
      leftoverObservation: z.boolean().optional().default(false)
    }).optional()
  }).optional()
});

// Valores por defecto para aplicaciones
export const aplicacionDefaultValues = {
  workType: "A",
  coverage: "total",
  paymentMethodToWorkers: "trato",
  workState: "pending",
  syncApp: false,
  specificData: {
    ppe: {
      gloves: true,
      applicatorSuit: true,
      respirator: true,
      faceShield: true,
      apron: true,
      boots: true,
      noseMouthProtector: true,
    }
  }
};

// Configuración completa para tipo A
export const aplicacionConfig: WorkTypeConfig = {
  workType: "A",
  title: "Aplicaciones de Productos",
  description: "Gestión de aplicaciones de pesticidas, fertilizantes y otros productos químicos",
  icon: TestTubeDiagonal,
  
  formSections: aplicacionFormSections,
  defaultValues: aplicacionDefaultValues,
  validationSchema: aplicacionValidationSchema,
  
  gridColumns: aplicacionGridColumns,
  
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