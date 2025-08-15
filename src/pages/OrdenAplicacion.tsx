import { useState, useEffect, useMemo } from "react";
import { Grid } from "@/components/Grid/Grid";
import { FormGrid } from "@/components/Grid/FormGrid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Clock,
  Ban,
  Map,
  EyeOff,
  Zap,
  FileText
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { 
  workerFormSchema, 
  machineryFormSchema, 
  productFormSchema,
  WorkerFormData,
  MachineryFormData,
  ProductFormData,
  FormGridRules
} from "@/lib/validationSchemas";
import { createOrdenAplicacionRules } from "@/lib/fieldRules/ordenAplicacionRules";
import { Button } from "@/components/ui/button";
import { SplitButton, SplitButtonOption } from "@/components/ui/split-button";
import WizardOrdenAplicacion from "@/components/Wizard/WizardOrdenAplicacion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import ProductSelectionModal from "@/components/ProductSelectionModal";
import { z } from "zod";
import { IWork } from "@eon-lib/eon-mongoose";
import { IWorkers } from "@eon-lib/eon-mongoose";
import { IWorkerList } from "@eon-lib/eon-mongoose";
import { IMachinery } from "@eon-lib/eon-mongoose";
import { IMachineryList } from "@eon-lib/eon-mongoose";
import { IProducts } from "@eon-lib/eon-mongoose";
import { IProductCategory } from "@eon-lib/eon-mongoose";
// @ts-ignore
import { IWarehouseProduct } from "@eon-lib/eon-mongoose";
import { ITaskType } from "@eon-lib/eon-mongoose";
import { ITask } from "@eon-lib/eon-mongoose";
import workService from "@/_services/workService";
import workerService from "@/_services/workerService";
import machineryService from "@/_services/machineryService";
import productService from "@/_services/productService";
import productCategoryService from "@/_services/productCategoryService";
import inventoryProductService from "@/_services/inventoryProductService";
import faenaService from "@/_services/taskTypeService";
import laborService from "@/_services/taskService";
import listaCuartelesService from "@/_services/listaCuartelesService";
import workerListService from "@/_services/workerListService";
import listaMaquinariasService from "@/_services/machineryListService";
import { IOperationalArea } from "@eon-lib/eon-mongoose";
import { toast } from "@/components/ui/use-toast";
import MapView from "@/components/MapView/MapView";
import { mapLocations } from "@/lib/mockups/mapMockup";
import GanttChart from "@/components/GanttChart/GanttChart";
import { transformWorkToGanttTask, GanttTask } from "@/lib/mockups/ganttMockup";
import { DESIGN_TOKENS, LAYOUT_CONSTANTS } from "@/lib/constants";

// Interfaces for TaskType (Faena) and Task (Labor)
interface TaskType {
  id: string;
  name: string;
}

// Match this to the Task interface in IWork.ts
interface Task {
  _id: string;
  taskTypeId: string;
  taskName: string;
  optionalCode: string;
  taskPrice?: number;
  optimalYield?: number;
  isEditableInApp?: boolean;
  usesWetCalculationPerHa?: boolean;
  usageContext?: string;
  maxHarvestYield?: number;
  showTotalEarningsInApp?: boolean;
  associatedProducts?: any[];
  requiresRowCount?: boolean;
  requiresHourLog?: boolean;
}

// Interface for Cuarteles (Barracks) - using BarracksList type

// Render function for the workState field
const renderWorkState = (value: string) => {
  if (value === 'confirmed') {
    return (
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        <span>Confirmada</span>
      </div>
    );
  } else if (value === 'pending') {
    return (
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
        <span>Pendiente</span>
      </div>
    );
  } else if (value === 'void') {
    return (
      <div className="flex items-center">
        <XCircle className="h-4 w-4 text-muted-foreground mr-2" />
        <span>Nula</span>
      </div>
    );
  } else if (value === 'blocked') {
    return (
      <div className="flex items-center">
        <XCircle className="h-4 w-4 text-red-500 mr-2" />
        <span>Bloqueada</span>
      </div>
    );
  }
  return value;
};



// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Orden: {row.orderNumber}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Cuartel:</strong> {row.barracks}</p>
        <p><strong>Especie:</strong> {row.species}</p>
        <p><strong>Variedad:</strong> {row.variety}</p>
        <p><strong>Estado Fenológico:</strong> {row.phenologicalState}</p>
      </div>
      <div>
        <p><strong>Hectáreas:</strong> {row.hectares}</p>
        <p><strong>Hectáreas Aplicadas:</strong> {row.appliedHectares}</p>
        <p><strong>Cobertura:</strong> {row.coverage}</p>
        <p><strong>Objetivo General:</strong> {row.generalObjective}</p>
      </div>
      <div>
        <p><strong>Observación:</strong> {row.observation}</p>
        <p><strong>Fecha de Inicio:</strong> {row.startDate} {row.hourStartDate}</p>
        <p><strong>Fecha de Fin:</strong> {row.endDate} {row.hourEndDate}</p>
        <p><strong>Sincronización con App:</strong> {row.syncApp ? 'Sí' : 'No'}</p>
      </div>
    </div>
    
    {/* Responsables */}
    {row.responsibles && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Responsables</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {row.responsibles.supervisor && (
            <div>
              <p><strong>Supervisor:</strong> {row.responsibles.supervisor.name || row.responsibles.supervisor.userId}</p>
            </div>
          )}
          {row.responsibles.planner && (
            <div>
              <p><strong>Planificador:</strong> {row.responsibles.planner.name || row.responsibles.planner.userId}</p>
            </div>
          )}
          {row.responsibles.technicalVerifier && (
            <div>
              <p><strong>Verificador Técnico:</strong> {row.responsibles.technicalVerifier.name || row.responsibles.technicalVerifier.userId}</p>
            </div>
          )}
        </div>
        {row.responsibles.applicators && row.responsibles.applicators.length > 0 && (
          <div className="mt-2">
            <p><strong>Aplicadores:</strong></p>
            <ul className="list-disc pl-5">
              {row.responsibles.applicators.map((applicator: any, index: number) => (
                <li key={index}>{applicator.name || applicator.userId}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
    
    {/* Equipo de Protección Personal */}
    {row.ppe && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Equipo de Protección Personal</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <p><strong>Guantes:</strong> {row.ppe.gloves ? 'Sí' : 'No'}</p>
          <p><strong>Traje de Aplicador:</strong> {row.ppe.applicatorSuit ? 'Sí' : 'No'}</p>
          <p><strong>Respirador:</strong> {row.ppe.respirator ? 'Sí' : 'No'}</p>
          <p><strong>Protector Facial:</strong> {row.ppe.faceShield ? 'Sí' : 'No'}</p>
          <p><strong>Delantal:</strong> {row.ppe.apron ? 'Sí' : 'No'}</p>
          <p><strong>Botas:</strong> {row.ppe.boots ? 'Sí' : 'No'}</p>
          <p><strong>Protector Nariz-Boca:</strong> {row.ppe.noseMouthProtector ? 'Sí' : 'No'}</p>
        </div>
        {row.ppe.others && (
          <p className="mt-2"><strong>Otros:</strong> {row.ppe.others}</p>
        )}
      </div>
    )}
    
    {/* Protocolo de Lavado */}
    {row.washing && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Protocolo de Lavado</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <p><strong>Traje 1:</strong> {row.washing.suit1 ? 'Sí' : 'No'}</p>
          <p><strong>Traje 2:</strong> {row.washing.suit2 ? 'Sí' : 'No'}</p>
          <p><strong>Traje 3:</strong> {row.washing.suit3 ? 'Sí' : 'No'}</p>
          <p><strong>Porta Filtro 1:</strong> {row.washing.filterHolder1 ? 'Sí' : 'No'}</p>
          <p><strong>Porta Filtro 2:</strong> {row.washing.filterHolder2 ? 'Sí' : 'No'}</p>
          <p><strong>Porta Filtro 3:</strong> {row.washing.filterHolder3 ? 'Sí' : 'No'}</p>
          <p><strong>Triple Lavado:</strong> {row.washing.tripleWash ? 'Sí' : 'No'}</p>
          <p><strong>Maquinaria:</strong> {row.washing.machinery ? 'Sí' : 'No'}</p>
          <p><strong>Sobrantes:</strong> {row.washing.leftovers ? 'Sí' : 'No'}</p>
          <p><strong>Observación de Sobrantes:</strong> {row.washing.leftoverObservation ? 'Sí' : 'No'}</p>
        </div>
      </div>
    )}
  </div>
);

// Form configuration for adding new orden de aplicación
const formSections: SectionConfig[] = [
  {
    id: "orden-info-basic",
    title: "Información Básica",
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
    id: "orden-info-detail",
    title: "Detalles de Aplicación",
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
    id: "orden-info-task",
    title: "Información de Tarea",
    fields: [
      {
        id: "taskType",
        type: "select",
        label: "Faena",
        name: "taskType",
        placeholder: "Seleccione una faena",
        // options will be set dynamically in the component
      },
      {
        id: "task",
        type: "select",
        label: "Labor",
        name: "task",
        placeholder: "Seleccione una labor",
        // options will be set dynamically based on selected taskType
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
      },
    ],
  },
  {
    id: "orden-info-payment",
    title: "Información de Pago",
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
    id: "orden-info-dates",
    title: "Fechas y Horas",
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
        name: "hourStartDate"
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
        name: "hourEndDate"
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
        name: "reEntryHour"
      },
    ],
  },
  {
    id: "orden-info-climate",
    title: "Condiciones Climáticas",
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
      },
    ],
  },
  {
    id: "orden-info-app",
    title: "Información para App",
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
      },
    ],
  },
  {
    id: "orden-info-responsibles",
    title: "Responsables",
    fields: [
      {
        id: "responsibles.supervisor.userId",
        type: "select",
        label: "Supervisor",
        name: "responsibles.supervisor.userId",
        placeholder: "Seleccione un supervisor",
        options: [] // Will be populated dynamically
      },
      {
        id: "responsibles.planner.userId",
        type: "select",
        label: "Planificador",
        name: "responsibles.planner.userId",
        placeholder: "Seleccione un planificador",
        options: [] // Will be populated dynamically
      },
      {
        id: "responsibles.technicalVerifier.userId",
        type: "select",
        label: "Verificador Técnico",
        name: "responsibles.technicalVerifier.userId",
        placeholder: "Seleccione un verificador técnico",
        options: [] // Will be populated dynamically
      },
      {
        id: "responsibles.applicators.0.userId",
        type: "select",
        label: "Aplicador Principal",
        name: "responsibles.applicators.0.userId",
        placeholder: "Seleccione un aplicador principal",
        options: [] // Will be populated dynamically
      },
    ],
  },
  {
    id: "orden-info-ppe",
    title: "Equipo de Protección Personal",
    fields: [
      {
        id: "ppe.gloves",
        type: "checkbox",
        label: "Guantes",
        name: "ppe.gloves",
        defaultValue: true
      },
      {
        id: "ppe.applicatorSuit",
        type: "checkbox",
        label: "Traje de Aplicador",
        name: "ppe.applicatorSuit",
        defaultValue: true
      },
      {
        id: "ppe.respirator",
        type: "checkbox",
        label: "Respirador",
        name: "ppe.respirator",
        defaultValue: true
      },
      {
        id: "ppe.faceShield",
        type: "checkbox",
        label: "Protector Facial",
        name: "ppe.faceShield",
        defaultValue: true
      },
      {
        id: "ppe.apron",
        type: "checkbox",
        label: "Delantal",
        name: "ppe.apron",
        defaultValue: true
      },
      {
        id: "ppe.boots",
        type: "checkbox",
        label: "Botas",
        name: "ppe.boots",
        defaultValue: true
      },
      {
        id: "ppe.noseMouthProtector",
        type: "checkbox",
        label: "Protector Nariz-Boca",
        name: "ppe.noseMouthProtector",
        defaultValue: true
      },
      {
        id: "ppe.others",
        type: "textarea",
        label: "Otros Equipos",
        name: "ppe.others",
        placeholder: "Otros equipos de protección requeridos"
      },
    ],
  },
  {
    id: "orden-info-washing",
    title: "Protocolo de Lavado",
    fields: [
      {
        id: "washing.suit1",
        type: "checkbox",
        label: "Traje 1",
        name: "washing.suit1"
      },
      {
        id: "washing.suit2",
        type: "checkbox",
        label: "Traje 2",
        name: "washing.suit2"
      },
      {
        id: "washing.suit3",
        type: "checkbox",
        label: "Traje 3",
        name: "washing.suit3"
      },
      {
        id: "washing.filterHolder1",
        type: "checkbox",
        label: "Porta Filtro 1",
        name: "washing.filterHolder1"
      },
      {
        id: "washing.filterHolder2",
        type: "checkbox",
        label: "Porta Filtro 2",
        name: "washing.filterHolder2"
      },
      {
        id: "washing.filterHolder3",
        type: "checkbox",
        label: "Porta Filtro 3",
        name: "washing.filterHolder3"
      },
      {
        id: "washing.tripleWash",
        type: "checkbox",
        label: "Triple Lavado",
        name: "washing.tripleWash"
      },
      {
        id: "washing.machinery",
        type: "checkbox",
        label: "Maquinaria",
        name: "washing.machinery"
      },
      {
        id: "washing.leftovers",
        type: "checkbox",
        label: "Sobrantes",
        name: "washing.leftovers"
      },
      {
        id: "washing.leftoverObservation",
        type: "checkbox",
        label: "Observación de Sobrantes",
        name: "washing.leftoverObservation"
      },
    ],
  }
];

// Form validation schema
const orderFormValidationSchema = z.object({
  workType: z.string().default("A"),
  orderNumber: z.string({ invalid_type_error: "El número de orden debe ser texto" }).min(1, { message: "El número de orden es obligatorio" }),
  executionDate: z.string({ invalid_type_error: "La fecha debe ser una fecha válida" }),
  barracks: z.string({ invalid_type_error: "El cuartel debe ser texto" }).min(1, { message: "El cuartel es obligatorio" }),
  species: z.string({ invalid_type_error: "La especie debe ser texto" }).min(1, { message: "La especie es obligatoria" }),
  variety: z.string({ invalid_type_error: "La variedad debe ser texto" }).min(1, { message: "La variedad es obligatoria" }),
  phenologicalState: z.string({ invalid_type_error: "El estado fenológico debe ser texto" }).min(1, { message: "El estado fenológico es obligatorio" }),
  hectares: z.number({ invalid_type_error: "Las hectáreas deben ser un número" }).min(0, { message: "Las hectáreas no pueden ser negativas" }),
  appliedHectares: z.number({ invalid_type_error: "Las hectáreas aplicadas deben ser un número" }).min(0, { message: "Las hectáreas aplicadas no pueden ser negativas" }),
  coverage: z.number({ invalid_type_error: "La cobertura debe ser un número" }).optional(),
  generalObjective: z.string({ invalid_type_error: "El objetivo general debe ser texto" }).min(1, { message: "El objetivo general es obligatorio" }),
  observation: z.string({ invalid_type_error: "La observación debe ser texto" }).optional(),
  observationApp: z.string({ invalid_type_error: "La observación de app debe ser texto" }).optional(),
  startDate: z.string({ invalid_type_error: "La fecha de inicio debe ser texto" }).optional(),
  hourStartDate: z.string({ invalid_type_error: "La hora de inicio debe ser texto" }).optional(),
  endDate: z.string({ invalid_type_error: "La fecha de fin debe ser texto" }).optional(),
  hourEndDate: z.string({ invalid_type_error: "La hora de fin debe ser texto" }).optional(),
  gracePeriodEndDate: z.string({ invalid_type_error: "La fecha de término de carencia debe ser texto" }).optional(),
  reEntryDate: z.string({ invalid_type_error: "La fecha de reingreso debe ser texto" }).optional(),
  reEntryHour: z.string({ invalid_type_error: "La hora de reingreso debe ser texto" }).optional(),
  climateConditions: z.string({ invalid_type_error: "Las condiciones climáticas deben ser texto" }).optional(),
  windSpeed: z.string({ invalid_type_error: "La velocidad del viento debe ser texto" }).optional(),
  temperature: z.string({ invalid_type_error: "La temperatura debe ser texto" }).optional(),
  humidity: z.string({ invalid_type_error: "La humedad debe ser texto" }).optional(),
  syncApp: z.boolean({ invalid_type_error: "El campo syncApp debe ser verdadero o falso" }).default(false),
  appUser: z.string({ invalid_type_error: "El usuario de la app debe ser texto" }).optional(),
  workState: z.string({ invalid_type_error: "El estado del trabajo debe ser texto" }).default("pending"),
  
  // Task related fields
  rowNumber: z.string().optional(),
  dosification: z.string().optional(),
  taskType: z.string({ invalid_type_error: "Debe seleccionar una faena" }).min(1, { message: "La faena es obligatoria" }),
  task: z.union([
    z.string(),  // For string task IDs
    z.object({
      _id: z.string().min(1, { message: "Debe seleccionar una labor" }),
      taskTypeId: z.string(),
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
  calibrationPerHectare: z.number().optional(),
  
  // Payment related fields
  taskOptimalYield: z.number().optional(),
  initialBonusToWorkers: z.number().optional(),
  paymentMethodToWorkers: z.string().optional(),
  taskPrice: z.number().optional(),
  
  // Responsibles validation
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
    }).optional(),
    applicators: z.array(
      z.object({
        userId: z.string().optional(),
        name: z.string().optional()
      })
    ).optional()
  }).optional(),
  
  // PPE validation
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
  
  // Washing validation
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
});



const OrdenAplicacion = () => {
  // ====================================
  // CONFIGURACIONES
  // ====================================
  
  // const navigate = useNavigate();
  
  // Opciones del SplitButton para tipos de ingreso
  const ingresoOptions: SplitButtonOption[] = [
    {
      label: "Ingreso Guiado",
      value: "wizard",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: "Ingreso Completo",
      value: "complete",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  // Functions for product selection modal
  const handleProductModalOpen = (field: any) => {
    setCurrentProductField(field);
    setIsProductModalOpen(true);
  };

  const handleProductSelect = (product: any) => {
    if (currentProductField) {
      currentProductField.onChange(product.name);
      
      // TODO: Implementar auto-llenado de unidad de medida
      // Cuando el producto tenga unitOfMeasurement, podríamos actualizarlo automáticamente
      // Para esto necesitaríamos acceso al formulario padre (React Hook Form)
    }
    setIsProductModalOpen(false);
    setCurrentProductField(null);
  };

  // Función para manejar la selección del tipo de ingreso
  const handleIngresoOptionSelect = (option: SplitButtonOption) => {
    if (option.value === "wizard") {
      // Abrir wizard en el dialog
      setFormType("wizard");
      setSelectedOrden(null);
      setIsEditMode(false);
      setSelectedCuartel(null);
      setSelectedTaskType('');
      setIsDialogOpen(true);
    } else if (option.value === "complete") {
      // Abrir el formulario completo actual
      setFormType("complete");
      setSelectedOrden(null);
      setIsEditMode(false);
      setSelectedCuartel(null);
      setSelectedTaskType('');
      setIsDialogOpen(true);
    }
  };
  
  // Variable configurable para las horas por jornada
  const HOURS_PER_WORKDAY = 8; // 1 jornada = 8 horas
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formType, setFormType] = useState<"complete" | "wizard">("complete");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProductField, setCurrentProductField] = useState<any>(null);
  const [ordenesAplicacion, setOrdenesAplicacion] = useState<IWork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<IWork | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Workers state
  const [workers, setWorkers] = useState<IWorkers[]>([]);
  
  // Worker list state (for selectable dropdown)
  const [workerList, setWorkerList] = useState<IWorkerList[]>([]);
  
  // Machinery state
  const [machinery, setMachinery] = useState<IMachinery[]>([]);
  
  // Machinery list state (for selectable dropdown)
  const [machineryList, setMachineryList] = useState<IMachineryList[]>([]);
  
  // State for taskTypes and tasks
  const [taskTypes, setTaskTypes] = useState<ITaskType[]>([]);
  const [allTasks, setAllTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  
  // Cuarteles state
  const [cuarteles, setCuarteles] = useState<IOperationalArea[]>([]);
  const [selectedCuartel, setSelectedCuartel] = useState<IOperationalArea | null>(null);
  
  // Products state
  const [products, setProducts] = useState<IProducts[]>([]);
  
  // Product categories and warehouse products state
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([]);
  const [warehouseProducts, setWarehouseProducts] = useState<any[]>([]);
  const [filteredWarehouseProducts, setFilteredWarehouseProducts] = useState<any[]>([]);
  
  // State for visibility controls
  const [showMap, setShowMap] = useState(false);
  const [showGantt, setShowGantt] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  // State for Gantt chart data
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);

  // Get propertyId from AuthStore
  const { propertyId } = useAuthStore();

  // ====================================
  // FIELD RULES FOR ORDERS GRID
  // ====================================
  // Column configuration for the orders  grid
  const ordersGridcolumns: Column[] = [
    {
      id: "id",
      header: "ID",
      accessor: "_id",
      visible: true,
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
    },
    {
      id: "barracks",
      header: "Cuartel",
      accessor: "barracks",
      visible: true,
      sortable: true,
      groupable: true,
      render: (value: string) => {
        return cuarteles.find(cuartel => cuartel._id === value)?.areaName;
      }
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
      id: "workState",
      header: "Estado",
      accessor: "workState",
      visible: true,
      sortable: true,
      groupable: true,
      render: renderWorkState,
    }
  ];

  // ====================================
  // FIELD RULES FOR MAIN FORM
  // ====================================
  const mainFormRules: FormGridRules = useMemo(() => {
    return createOrdenAplicacionRules({
      cuartelesOptions: cuarteles,
      taskOptions: allTasks, // Usar allTasks para tener acceso completo a taskTypeId
      taskTypeOptions: taskTypes,
      workerOptions: workerList.map(worker => ({
        ...worker,
        fullName: `${worker.names} ${worker.lastName}`
      }))
    });
  }, [cuarteles, allTasks, taskTypes, workerList]);

  // ====================================
  // FIELD RULES FOR WORKERS GRID
  // ====================================
  const workerGridRules: FormGridRules = useMemo(() => ({
    rules: [
      // 1. Preseleccionar "valor rendimiento" desde "precio de tarea" del padre
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'yieldValue',
          source: 'parent',
          sourceField: 'taskPrice'
        }
      },
      
      // 2. Preseleccionar datos del trabajador seleccionado
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'classification',
          preset: (formData, parentData, externalData) => {
            const worker = externalData?.workerList?.find((w: any) => w._id === formData.worker);
            return worker?.defaultClassification || 'General';
          }
        }
      },
      // preseleccionar tipo de pago
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'paymentMethod',
          source: 'parent',
          sourceField: 'paymentMethodToWorkers'
        }
      },
      
      // 3. Preseleccionar fecha actual
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'date',
          preset: () => new Date().toISOString().split('T')[0]
        }
      },
      
      // 4. Calcular total horas rendimiento inicial (1 jornada = 8 horas por defecto)
      {
        trigger: { field: 'worker' },
        action: {
          type: 'calculate',
          targetField: 'totalHoursYield',
          calculate: (formData) => {
            const workingDay = parseFloat(formData.workingDay) || 1; // Por defecto 1 jornada
            const totalHours = workingDay * HOURS_PER_WORKDAY;
            console.log('Calculating initial totalHoursYield:', {
              workingDay,
              hoursPerWorkday: HOURS_PER_WORKDAY,
              totalHours
            });
            return totalHours;
          }
        }
      },
      
              // 5. Calcular "total horas rendimiento" = jornada * horas por jornada
        {
          trigger: { field: 'workingDay' },
          action: {
            type: 'calculate',
            targetField: 'totalHoursYield',
            calculate: (formData) => {
              const workingDay = parseFloat(formData.workingDay) || 0;
              const totalHours = workingDay * HOURS_PER_WORKDAY;
              console.log('Calculating totalHoursYield:', {
                workingDay,
                hoursPerWorkday: HOURS_PER_WORKDAY,
                totalHours
              });
              return totalHours;
            }
          }
        },
        
        // 6. Calcular "valor día" = sueldo / 30 (si sueldo > 0)
      {
        trigger: { field: 'salary' },
        action: {
          type: 'calculate',
          targetField: 'dayValue',
          calculate: (formData) => {
            const salary = parseFloat(formData.salary) || 0;
            return salary > 0 ? salary / 30 : 0;
          }
        }
      },
      
              // 7. Calcular "total trato" = rendimiento * valor rendimiento
        {
          trigger: { field: 'yield' },
          action: {
            type: 'calculate',
            targetField: 'totalDeal',
            calculate: (formData) => {
              const yield_value = parseFloat(formData.yield) || 0;
              const yieldValue = parseFloat(formData.yieldValue) || 0;
              return yield_value * yieldValue;
            }
          }
        },
        
        {
          trigger: { field: 'yieldValue' },
          action: {
            type: 'calculate',
            targetField: 'totalDeal',
            calculate: (formData) => {
              const yield_value = parseFloat(formData.yield) || 0;
              const yieldValue = parseFloat(formData.yieldValue) || 0;
              return yield_value * yieldValue;
            }
          }
        },
        
        // 8. Calcular "total diario" = valor día x jornada (para día laboral)
      {
        trigger: { field: 'workingDay' },
        action: {
          type: 'calculate',
          targetField: 'dailyTotal',
          calculate: (formData) => {
            const dayValue = parseFloat(formData.dayValue) || 0;
            const workingDay = parseFloat(formData.workingDay) || 1;
            return dayValue * workingDay;
          }
        }
      },
      
      {
        trigger: { field: 'dayValue' },
        action: {
          type: 'calculate',
          targetField: 'dailyTotal',
          calculate: (formData) => {
            const dayValue = parseFloat(formData.dayValue) || 0;
            const workingDay = parseFloat(formData.workingDay) || 1;
            return dayValue * workingDay;
          }
        }
      },
      
              // 9. Función auxiliar para calcular value según método de pago
        ...[
          'paymentMethod', 'totalDeal', 'bonus', 'dailyTotal'
        ].map(field => ({
        trigger: { field },
        action: {
          type: 'calculate' as const,
          targetField: 'value' as const,
          calculate: (formData: any) => {
            // Recalcular totalDeal basado en valores actuales
            const yield_value = parseFloat(formData.yield) || 0;
            const yieldValue = parseFloat(formData.yieldValue) || 0;
            const recalculatedTotalDeal = yield_value * yieldValue;
            
            // Recalcular dailyTotal basado en valores actuales
            const salary = parseFloat(formData.salary) || 0;
            const dayValue = salary > 0 ? salary / 30 : parseFloat(formData.dayValue) || 0;
            const workingDay = parseFloat(formData.workingDay) || 1;
            const recalculatedDailyTotal = dayValue * workingDay;
            
            const bonus = parseFloat(formData.bonus) || 0;
            const paymentMethod = formData.paymentMethod;
            
            console.log('Calculating value for payment method:', paymentMethod, {
              recalculatedTotalDeal,
              recalculatedDailyTotal,
              bonus,
              yield_value,
              yieldValue,
              dayValue,
              workingDay
            });
            
            switch (paymentMethod) {
              case 'trato':
                // Total = (rendimiento x valor trato) + bono
                return recalculatedTotalDeal + bonus;
                
                            case 'trato-dia':
                // Total = ((rendimiento x valor trato) + bono) + valor día
                return recalculatedTotalDeal + bonus + recalculatedDailyTotal;
                
              case 'ajuste-septimodia':
                // Total = valor día + bono (mismo cálculo que día laboral)
                return recalculatedDailyTotal + bonus;
                
              case 'dia-laboral':
                // Total = valor día + bono
                return recalculatedDailyTotal + bonus;
                
              case 'mayor-trato-dia':
                // Total = mayor entre (trato + bono) o (día + bono)
                const tratoTotal = recalculatedTotalDeal + bonus;
                const diaTotal = recalculatedDailyTotal + bonus;
                const maxValue = Math.max(tratoTotal, diaTotal);
                console.log('Mayor entre trato y día:', {
                  tratoTotal,
                  diaTotal,
                  maxValue
                });
                return maxValue;
                
              case 'trato-dia-laboral':
                // Total = (trato + bono) - día laboral
                return (recalculatedTotalDeal + bonus) - recalculatedDailyTotal;
                
              default:
                return 0;
            }
          }
        }
      })),
      
              // 10. Cadena de recálculos cuando cambia el salario
        {
          trigger: { field: 'salary' },
          action: {
            type: 'calculate',
            targetField: 'dailyTotal',
          calculate: (formData) => {
            const salary = parseFloat(formData.salary) || 0;
            const dayValue = salary > 0 ? salary / 30 : parseFloat(formData.dayValue) || 0;
            const workingDay = parseFloat(formData.workingDay) || 1;
            return dayValue * workingDay;
          }
        }
      },
      
      {
        trigger: { field: 'salary' },
        action: {
          type: 'calculate',
          targetField: 'value',
          calculate: (formData) => {
            const salary = parseFloat(formData.salary) || 0;
            const dayValue = salary > 0 ? salary / 30 : parseFloat(formData.dayValue) || 0;
            const workingDay = parseFloat(formData.workingDay) || 1;
            const calculatedDailyTotal = dayValue * workingDay;
            
            // Recalcular totalDeal basado en valores actuales
            const yield_value = parseFloat(formData.yield) || 0;
            const yieldValue = parseFloat(formData.yieldValue) || 0;
            const recalculatedTotalDeal = yield_value * yieldValue;
            
            const bonus = parseFloat(formData.bonus) || 0;
            const paymentMethod = formData.paymentMethod;
            
            console.log('Calculating value after salary change:', paymentMethod, {
              recalculatedTotalDeal,
              calculatedDailyTotal,
              bonus,
              salary,
              dayValue,
              workingDay
            });
            
            switch (paymentMethod) {
              case 'trato':
                return recalculatedTotalDeal + bonus;
              case 'trato-dia':
                return recalculatedTotalDeal + bonus + calculatedDailyTotal;
              case 'ajuste-septimodia':
                return calculatedDailyTotal + bonus;
              case 'dia-laboral':
                return calculatedDailyTotal + bonus;
              case 'mayor-trato-dia':
                const tratoTotal = recalculatedTotalDeal + bonus;
                const diaTotal = calculatedDailyTotal + bonus;
                const maxValue = Math.max(tratoTotal, diaTotal);
                console.log('Mayor entre trato y día (salary change):', {
                  tratoTotal,
                  diaTotal,
                  maxValue
                });
                return maxValue;
              case 'trato-dia-laboral':
                return (recalculatedTotalDeal + bonus) - calculatedDailyTotal;
              default:
                return 0;
            }
          }
        }
      }
    ],
    parentData: selectedOrden,
    externalData: {
      workerList: workerList,
      taskPrice: selectedOrden?.taskPrice || selectedOrden?.task?.taskPrice || 0
    }
  }), [selectedOrden, workerList]);

  // ====================================
  // FIELD RULES FOR MACHINERY GRID
  // ====================================
    const machineryGridRules: FormGridRules = useMemo(() => ({
    rules: [
      // 1. Preseleccionar "valor tiempo" desde "precio por hora" de la maquinaria seleccionada
      {
        trigger: { field: 'machinery' },
        action: {
          type: 'preset',
          targetField: 'timeValue',
          preset: (formData, parentData, externalData) => {
            const machine = externalData?.machineryList?.find((m: any) => m._id === formData.machinery);
            const priceHour = machine?.priceHour ? parseFloat(machine.priceHour) : 0;
            console.log('Preselecting timeValue for machinery:', {
              machineryId: formData.machinery,
              machineName: machine?.equipment,
              priceHour: priceHour
            });
            return priceHour;
          }
        }
      },
      
      // 2. Calcular "valor total" cuando cambie "horas finales"
      {
        trigger: { field: 'finalHours' },
        action: {
          type: 'calculate',
          targetField: 'totalValue',
          calculate: (formData) => {
            const finalHours = parseFloat(formData.finalHours) || 0;
            const timeValue = parseFloat(formData.timeValue) || 0;
            const totalValue = finalHours * timeValue;
            console.log('Calculating totalValue from finalHours change:', {
              finalHours,
              timeValue,
              totalValue
            });
            return totalValue;
          }
        }
      },
      
      // 3. Calcular "valor total" cuando cambie "valor tiempo"
      {
        trigger: { field: 'timeValue' },
        action: {
          type: 'calculate',
          targetField: 'totalValue',
          calculate: (formData) => {
            const finalHours = parseFloat(formData.finalHours) || 0;
            const timeValue = parseFloat(formData.timeValue) || 0;
            const totalValue = finalHours * timeValue;
            console.log('Calculating totalValue from timeValue change:', {
              finalHours,
              timeValue,
              totalValue
            });
            return totalValue;
          }
        }
      }
    ],
    parentData: selectedOrden,
    externalData: {
      machineryList: machineryList
    }
  }), [selectedOrden, machineryList]);

  // Convert ordenesAplicacion to GanttTask format
  useEffect(() => {
    if (ordenesAplicacion.length > 0) {
      const convertedTasks = ordenesAplicacion.map(orden => transformWorkToGanttTask(orden));
      setGanttTasks(convertedTasks);
    } else {
      setGanttTasks([]);
    }
  }, [ordenesAplicacion]);

  // Save visibility preferences to localStorage
  useEffect(() => {
    localStorage.setItem('ordenAplicacion_showMap', JSON.stringify(showMap));
  }, [showMap]);

  useEffect(() => {
    localStorage.setItem('ordenAplicacion_showGantt', JSON.stringify(showGantt));
  }, [showGantt]);

  // Redirect to homepage if no propertyId is available
  useEffect(() => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "No hay un predio seleccionado. Por favor, seleccione un predio desde la página principal.",
        variant: "destructive",
      });
    }
  }, [propertyId]);

  // Fetch ordenes on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchOrdenesAplicacion();
      fetchTaskTypes();
      fetchTasks();
      fetchCuarteles();
      fetchProductCategories();
      fetchWarehouseProducts();
      fetchWorkerList();
      fetchMachineryList();
    }
  }, [propertyId]);

  // Set selected cuartel when editing a work order
  useEffect(() => {
    if (isEditMode && selectedOrden && cuarteles.length > 0) {
      const cuartelFromOrder = cuarteles.find(c => c._id === selectedOrden.barracks);
      if (cuartelFromOrder) {
        setSelectedCuartel(cuartelFromOrder);
        console.log('🔧 Setting cuartel from order:', {
          id: cuartelFromOrder._id,
          name: cuartelFromOrder.areaName,
          species: cuartelFromOrder.varietySpecies,
          variety: cuartelFromOrder.variety
        });
      }
    }
  }, [isEditMode, selectedOrden, cuarteles]);
  
  // Filter tasks when taskType changes
  // useEffect(() => {
  //   // Log data for debugging
  //   console.log('📋 Filtering tasks - Selected taskType:', selectedTaskType, typeof selectedTaskType);
  //   console.log('📋 All available tasks:', allTasks.length);
  //   console.log('📋 AllTasks array:', allTasks);
    
  //   if (selectedTaskType && selectedTaskType !== '' && selectedTaskType !== null && selectedTaskType !== undefined) {
  //     // Filter tasks by selected taskType (faena) - even if result is empty
  //     const tasksForType = allTasks.filter(task => task.taskTypeId === selectedTaskType);
  //     console.log('🔍 Filtered tasks for taskType:', tasksForType.length, tasksForType);
  //     if (tasksForType.length === 0) {
  //       console.log('⚠️ No labores found for selected faena - showing empty list');
  //     }
  //     setFilteredTasks(tasksForType); // This could be an empty array, and that's correct
  //   } else {
  //     // Show all tasks ONLY when no taskType is selected (empty string, null, or undefined)
  //     console.log('📂 Showing all tasks (no faena selected):', allTasks.length);
  //     setFilteredTasks([...allTasks]); // Create a copy to force re-render
  //   }
    
  //   console.log('📋 FilteredTasks after update:', filteredTasks.length);
  // }, [selectedTaskType, allTasks]);
  
  // Fetch task types and tasks from services
  const fetchTaskTypes = async () => {
    try {
      const data = await faenaService.findAll();
      console.log('Fetched task types:', data);
      setTaskTypes(data);
    } catch (error) {
      console.error("Error loading task types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las faenas",
        variant: "destructive",
      });
    }
  };
  
  const fetchTasks = async () => {
    try {
      const data = await laborService.findAll();
      console.log('Fetched tasks:', data);
      setAllTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las labores",
        variant: "destructive",
      });
    }
  };

  const fetchCuarteles = async () => {
    try {
      const data = await listaCuartelesService.findProductiveAreas();
      console.log('Fetched cuarteles:', data);
      setCuarteles(data);
    } catch (error) {
      console.error("Error loading cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cuarteles",
        variant: "destructive",
      });
    }
  };
  
  const fetchProductCategories = async () => {
    try {
      const data = await productCategoryService.findByEnterpriseId();
      console.log('Fetched product categories:', data);
      // Ensure we always have an array
      const categoriesArray = Array.isArray(data) ? data : [];
      setProductCategories(categoriesArray);
    } catch (error) {
      console.error("Error loading product categories:", error);
      // Set empty array on error
      setProductCategories([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de producto",
        variant: "destructive",
      });
    }
  };
  
  const fetchWarehouseProducts = async () => {
    try {
      const data = await inventoryProductService.findAll();
      console.log('Fetched warehouse products:', data);
      // Ensure we always have an array
      const productsArray = Array.isArray(data) ? data : [];
      setWarehouseProducts(productsArray);
      setFilteredWarehouseProducts(productsArray);
    } catch (error) {
      console.error("Error loading warehouse products:", error);
      // Set empty arrays on error
      setWarehouseProducts([]);
      setFilteredWarehouseProducts([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del almacén",
        variant: "destructive",
      });
    }
  };
  
  // Function to filter warehouse products by category
  // const filterWarehouseProductsByCategory = (categoryDescription: string) => {
  //   if (!categoryDescription || categoryDescription === '') {
  //     setFilteredWarehouseProducts(warehouseProducts);
  //   } else {
  //     const filtered = warehouseProducts.filter(product => 
  //       product.category === categoryDescription
  //     );
  //     setFilteredWarehouseProducts(filtered);
  //   }
  // };

  // Function to handle taskType change
  // const handleTaskTypeChange = (taskTypeId: string, formSetValue?: any, formGetValues?: any) => {
  //   console.log('🏷️ TaskType (Faena) changed to:', taskTypeId);
  //   setSelectedTaskType(taskTypeId);
    
  //   // Check if there's a currently selected task and if it belongs to the new taskType
  //   if (formSetValue && formGetValues) {
  //     const currentTaskId = formGetValues('task');
      
  //     if (currentTaskId) {
  //       // Find the currently selected task
  //       const currentTask = allTasks.find(task => 
  //         (task as any)._id === currentTaskId || (task as any).id === currentTaskId
  //       );
        
  //       if (currentTask) {
  //         // Check if the current task belongs to the new taskType
  //         if (currentTask.taskTypeId !== taskTypeId) {
  //           // Clear task selection if it doesn't belong to the new taskType
  //           formSetValue('task', '');
  //           console.log('🚨 Task cleared - it belonged to different faena:', {
  //             taskName: currentTask.taskName,
  //             oldTaskTypeId: currentTask.taskTypeId,
  //             newTaskTypeId: taskTypeId
  //           });
  //         } else {
  //           console.log('✅ Task maintained - it belongs to selected faena:', {
  //             taskName: currentTask.taskName,
  //             taskTypeId: taskTypeId
  //           });
  //         }
  //       } else {
  //         // If task not found, clear it to be safe
  //         formSetValue('task', '');
  //         console.log('⚠️ Task cleared - could not find task in allTasks');
  //       }
  //     } else {
  //       console.log('ℹ️ No task currently selected, nothing to clear');
  //     }
  //   }
  // };

  
  // Function to fetch ordenes data
  const fetchOrdenesAplicacion = async () => {
    setIsLoading(true);
    try {
      const data = await workService.findAll();
      // Handle both array responses and paginated responses
      const allWorksData = Array.isArray(data) ? data : (data as any)?.data || [];
      
      // Filter only works with workType === 'A' (Application/Órdenes de Aplicación)
      const ordenesData = allWorksData.filter((work: any) => work.workType === 'A');
      
      setOrdenesAplicacion(ordenesData);
      console.log('Órdenes de aplicación (filtered by workType A):', ordenesData);
    } catch (error) {
      console.error("Error loading órdenes de aplicación:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes de aplicación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new orden
  const handleAddOrden = async (data: Partial<IWork>) => {
    console.log("orden de aplicacion", data);

    try {
      await workService.createApplication(data);
      toast({
        title: "Éxito",
        description: "Orden de aplicación creada correctamente",
      });
      fetchOrdenesAplicacion();
    } catch (error) {
      console.error("Error al crear la orden de aplicación:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden de aplicación",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an orden
  const handleUpdateOrden = async (id: string | number, data: Partial<IWork>) => {
    try {
      await workService.updateWork(id, data);
      toast({
        title: "Éxito", 
        description: "Orden de aplicación actualizada correctamente",
      });
      fetchOrdenesAplicacion();
    } catch (error) {
      console.error(`Error al actualizar la orden de aplicación ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la orden de aplicación",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a cuartel (changing state to void)
  const handleVoidOrden = async (id: string | number) => {
    try {
      await workService.changeWorkState(id, "void");
      toast({
        title: "Éxito",
        description: "Orden de aplicación anulada correctamente",
      });
      fetchOrdenesAplicacion();
    } catch (error) {
      console.error(`Error al anular la orden de aplicación ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo anular la orden de aplicación",
        variant: "destructive",
      });
    }
  };

  // Function to generate options for wizard
  const getWizardOptions = () => {
    const cuartelesOptions = cuarteles.map(cuartel => ({
      value: cuartel._id,
      label: cuartel.areaName,
      varietySpecies: cuartel.varietySpecies,
      variety: cuartel.variety
    }));

    const taskTypeOptions = taskTypes.map(taskType => ({
      value: taskType.id,
      label: taskType.name
    }));

    const taskOptions = allTasks.map(task => ({
      value: (task as any)._id || (task as any).id,
      label: task.taskName
    }));

    const workerOptions = workerList.map(worker => ({
      value: worker._id || "",
      label: `${worker.names} ${worker.lastName} (${worker.rut})`
    }));

    return {
      cuartelesOptions,
      taskTypeOptions,
      taskOptions,
      supervisorOptions: workerOptions,
      plannerOptions: workerOptions,
      verifierOptions: workerOptions,
      applicatorOptions: workerOptions,
    };
  };

  // Function to handle wizard completion
  const handleWizardComplete = async (data: any) => {
    console.log("handleWizardComplete executed", data);
    
    // Process the task data before submission
    let processedData = { ...data };
    
    // If task is a string (selected ID), convert it to the expected object format
    if (typeof processedData.task === 'string') {
      const selectedTaskId = processedData.task;
      // Find the task using the ID
      const selectedTask = allTasks.find(task => (task as any)._id === selectedTaskId || (task as any).id === selectedTaskId);
      console.log('selectedTask', selectedTask);
      if (selectedTask) {
        // Convert ITask to the format expected by IWork.task
        processedData.task = {
          _id: (selectedTask as any)._id || (selectedTask as any).id,
          id: (selectedTask as any)._id || (selectedTask as any).id,
          taskTypeId: selectedTask.taskTypeId,
          optionalCode: selectedTask.optionalCode || '',
          taskName: selectedTask.taskName,
          taskPrice: selectedTask.taskPrice || 0,
          optimalYield: selectedTask.optimalYield || 0,
          isEditableInApp: selectedTask.isEditableInApp || false,
          usesWetCalculationPerHa: selectedTask.usesWetCalculationPerHa || false,
          usageContext: selectedTask.usageContext || '',
          maxHarvestYield: selectedTask.maxHarvestYield || 0,
          showTotalEarningsInApp: selectedTask.showTotalEarningsInApp || false,
          associatedProducts: selectedTask.associatedProducts ? 
            selectedTask.associatedProducts.map(product => ({
              product: { id: product.productId },
              quantityPerHectare: String(product.quantity || 0)
            })) : [],
          requiresRowCount: selectedTask.requiresRowCount || false,
          requiresHourLog: selectedTask.requiresHourLog || false
        };
      }
    }
    
    // Always create new for wizard (no edit mode in wizard for now)
    await handleAddOrden(processedData);
    setIsDialogOpen(false);
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWork>) => {
    console.log("handleFormSubmit executed", data);
    
    // Process the task data before submission
    let processedData = { ...data };
    
    // If task is a string (selected ID), convert it to the expected object format
    if (typeof processedData.task === 'string') {
      const selectedTaskId = processedData.task;
      // Find the task using the ID
      const selectedTask = allTasks.find(task => (task as any)._id === selectedTaskId || (task as any).id === selectedTaskId);
      console.log('selectedTask', selectedTask);
      if (selectedTask) {
        // Convert ITask to the format expected by IWork.task
        processedData.task = {
          // @ts-ignore
          _id: (selectedTask as any)._id || (selectedTask as any).id,
          id: (selectedTask as any)._id || (selectedTask as any).id,
          taskTypeId: selectedTask.taskTypeId,
          optionalCode: selectedTask.optionalCode || '',
          taskName: selectedTask.taskName,
          taskPrice: selectedTask.taskPrice || 0,
          optimalYield: selectedTask.optimalYield || 0,
          isEditableInApp: selectedTask.isEditableInApp || false,
          usesWetCalculationPerHa: selectedTask.usesWetCalculationPerHa || false,
          usageContext: selectedTask.usageContext || '',
          maxHarvestYield: selectedTask.maxHarvestYield || 0,
          showTotalEarningsInApp: selectedTask.showTotalEarningsInApp || false,
          associatedProducts: selectedTask.associatedProducts ? 
            selectedTask.associatedProducts.map(product => ({
              product: { id: product.productId },
              quantityPerHectare: String(product.quantity || 0)
            })) : [],
          requiresRowCount: selectedTask.requiresRowCount || false,
          requiresHourLog: selectedTask.requiresHourLog || false
        };
      }
    }
    
    if (isEditMode && selectedOrden) {
      handleUpdateOrden(selectedOrden.id || selectedOrden._id || '', processedData);
    } else {
      handleAddOrden(processedData);
      console.log('processedData', data);
    }
    setIsDialogOpen(false);
  };

  // Function to handle edit button click
  const handleEditClick = (orden: IWork) => {
    setSelectedOrden(orden);
    setIsEditMode(true);
    
    // Set the selected task type if available
    if (orden.taskType) {
      const taskTypeId = String(orden.taskType);
      setSelectedTaskType(taskTypeId);
      
      console.log('✏️ Edit mode - Setting taskType:', taskTypeId);
      console.log('✏️ Edit mode - orden.taskType:', orden.taskType);
    } else {
      // Clear taskType selection if not present
      setSelectedTaskType('');
      console.log('✏️ Edit mode - No taskType found, clearing selection');
    }
    
    // Clear selected cuartel - it will be set by useEffect when cuarteles are loaded
    setSelectedCuartel(null);
    
    setIsDialogOpen(true);
  };

  // Workers grid columns
  const workersColumns: Column[] = [
    {
      id: "worker",
      header: "Trabajador",
      accessor: "worker",
      visible: true,
      sortable: true,
      render: (value: string) => {
        const worker = workerList.find(w => w._id === value);
        return worker ? `${worker.names} ${worker.lastName}` : value;
      },
    },
    {
      id: "classification",
      header: "Clasificación",
      accessor: "classification",
      visible: true,
      sortable: true,
    },
    {
      id: "quadrille",
      header: "Cuadrilla",
      accessor: "quadrille",
      visible: true,
      sortable: true,
    },
    {
      id: "workingDay",
      header: "Jornada",
      accessor: "workingDay",
      visible: true,
      sortable: true,
    },
    {
      id: "paymentMethod",
      header: "Método de Pago",
      accessor: "paymentMethod",
      visible: true,
      sortable: true,
    },
    {
      id: "contractor",
      header: "Contratista",
      accessor: "contractor",
      visible: true,
      sortable: true,
    },
    {
      id: "date",
      header: "Fecha",
      accessor: "date",
      visible: true,
      sortable: true,
    },
    {
      id: "salary",
      header: "Salario",
      accessor: "salary",
      visible: true,
      sortable: true,
    },
    {
      id: "yield",
      header: "Rendimiento",
      accessor: "yield",
      visible: true,
      sortable: true,
    },
    {
      id: "totalHoursYield",
      header: "Total Horas Rendimiento",
      accessor: "totalHoursYield",
      visible: true,
      sortable: true,
    },
    {
      id: "yieldValue",
      header: "Valor Rendimiento",
      accessor: "yieldValue",
      visible: true,
      sortable: true,
    },
    {
      id: "overtime",
      header: "Horas Extra",
      accessor: "overtime",
      visible: true,
      sortable: true,
    },
    {
      id: "bonus",
      header: "Bono",
      accessor: "bonus",
      visible: true,
      sortable: true,
    },
    {
      id: "additionalBonuses",
      header: "Bonos Adicionales",
      accessor: "additionalBonuses",
      visible: true,
      sortable: true,
    },
    {
      id: "dayValue",
      header: "Valor Día",
      accessor: "dayValue",
      visible: true,
      sortable: true,
    },
    {
      id: "totalDeal",
      header: "Total Trato",
      accessor: "totalDeal",
      visible: true,
      sortable: true,
    },
    {
      id: "dailyTotal",
      header: "Total Diario",
      accessor: "dailyTotal",
      visible: true,
      sortable: true,
    },
    {
      id: "value",
      header: "Total",
      accessor: "value",
      visible: true,
      sortable: true,
    },
    {
      id: "exportPerformance",
      header: "Rendimiento Exportación",
      accessor: "exportPerformance",
      visible: true,
      sortable: true,
    },
    {
      id: "juicePerformance",
      header: "Rendimiento Jugo",
      accessor: "juicePerformance",
      visible: true,
      sortable: true,
    },
    {
      id: "othersPerformance",
      header: "Otros Rendimientos",
      accessor: "othersPerformance",
      visible: true,
      sortable: true,
    },
    {
      id: "state",
      header: "Estado",
      accessor: "state",
      visible: true,
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];
  
  // Machinery grid columns
  const machineryColumns: Column[] = [
    {
      id: "machinery",
      header: "Maquinaria",
      accessor: "machinery",
      visible: true,
      sortable: true,
      render: (value: string) => {
        const machine = machineryList.find(m => m._id === value);
        return machine ? `${machine.equipment} - ${machine.machineryCode} (${machine.brand})` : value;
      },
    },
    {
      id: "startTime",
      header: "Hora Inicio",
      accessor: "startTime",
      visible: true,
      sortable: true,
    },
    {
      id: "endTime",
      header: "Hora Fin",
      accessor: "endTime",
      visible: true,
      sortable: true,
    },
    {
      id: "finalHours",
      header: "Horas Finales",
      accessor: "finalHours",
      visible: true,
      sortable: true,
    },
    {
      id: "timeValue",
      header: "Valor Tiempo",
      accessor: "timeValue",
      visible: true,
      sortable: true,
    },
    {
      id: "totalValue",
      header: "Valor Total",
      accessor: "totalValue",
      visible: true,
      sortable: true,
    },
  ];

  // Products grid columns
  const productsColumns: Column[] = [
    {
      id: "product",
      header: "Producto",
      accessor: "product",
      visible: true,
      sortable: true,
    },
    {
      id: "category",
      header: "Categoría",
      accessor: "category",
      visible: true,
      sortable: true,
    },
    {
      id: "unitOfMeasurement",
      header: "Unidad de Medida",
      accessor: "unitOfMeasurement",
      visible: true,
      sortable: true,
    },
    {
      id: "amountPerHour",
      header: "Cantidad por Hora",
      accessor: "amountPerHour",
      visible: true,
      sortable: true,
    },
    {
      id: "amount",
      header: "Cantidad",
      accessor: "amount",
      visible: true,
      sortable: true,
    },
    {
      id: "netUnitValue",
      header: "Valor Unitario Neto",
      accessor: "netUnitValue",
      visible: true,
      sortable: true,
    },
    {
      id: "totalValue",
      header: "Valor Total",
      accessor: "totalValue",
      visible: true,
      sortable: true,
    },
    {
      id: "return",
      header: "Retorno",
      accessor: "return",
      visible: true,
      sortable: true,
    },
    {
      id: "machineryRelationship",
      header: "Relación Maquinaria",
      accessor: "machineryRelationship",
      visible: true,
      sortable: true,
    },
    {
      id: "packagingCode",
      header: "Código Envase",
      accessor: "packagingCode",
      visible: true,
      sortable: true,
    },
    {
      id: "invoiceNumber",
      header: "Número de Factura",
      accessor: "invoiceNumber",
      visible: true,
      sortable: true,
    },
  ];

  // Fetch workers on component mount and when selected order changes
  useEffect(() => {
    if (isEditMode && selectedOrden) {
      console.log('useEffect triggered for fetchWorkers:', { isEditMode, selectedOrden: selectedOrden?.id || selectedOrden?._id });
      fetchWorkers();
    }
  }, [isEditMode, selectedOrden]);

  // Additional useEffect to fetch workers when dialog opens in edit mode
  useEffect(() => {
    if (isDialogOpen && isEditMode && selectedOrden) {
      console.log('Dialog opened in edit mode, fetching workers for order:', selectedOrden?.id || selectedOrden?._id);
      fetchWorkers();
    }
  }, [isDialogOpen, isEditMode, selectedOrden]);

  // Fetch machinery on component mount and when selected order changes
  useEffect(() => {
    if (isEditMode && selectedOrden) {
      console.log('useEffect triggered for fetchMachinery:', { isEditMode, selectedOrden: selectedOrden?.id || selectedOrden?._id });
      fetchMachinery();
    }
  }, [isEditMode, selectedOrden]);

  // Fetch products on component mount and when selected order changes
  useEffect(() => {
    if (isEditMode && selectedOrden) {
      console.log('useEffect triggered for fetchProducts:', { isEditMode, selectedOrden: selectedOrden?.id || selectedOrden?._id });
      fetchProducts();
    }
  }, [isEditMode, selectedOrden]);

  // Function to fetch workers data for the current work
  const fetchWorkers = async () => {
    if (!selectedOrden) {
      console.log('No selected orden, skipping fetchWorkers');
      return;
    }
    
    try {
      console.log('Fetching workers for order:', selectedOrden?.id || selectedOrden?._id);
      const data = await workerService.findAll();
      console.log('All workers fetched:', data);
      
      const workId = selectedOrden.id || (selectedOrden as any)._id;
      console.log('Filtering workers by workId:', workId);
      
      // Handle both array responses and paginated responses
      const allWorkersData = Array.isArray(data) ? data : (data as any)?.data || [];
      console.log('Processed workers data:', allWorkersData);
      
      // Filter workers that belong to the current work and have state true
      const workWorkers = allWorkersData.filter((worker: any) => {
        const matches = worker.workId === workId && worker.state !== false;
        console.log(`Worker ${worker.id} - workId: ${worker.workId}, matches: ${matches}, state: ${worker.state}`);
        return matches;
      });
      
      console.log('Filtered workers for this order:', workWorkers);
      setWorkers(workWorkers);
    } catch (error) {
      console.error("Error loading workers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los trabajadores",
        variant: "destructive",
      });
    }
  };

  // Function to fetch machinery data for the current work
  const fetchMachinery = async () => {
    if (!selectedOrden) {
      console.log('No selected orden, skipping fetchMachinery');
      return;
    }
    
    try {
      console.log('Fetching machinery for order:', selectedOrden?.id || selectedOrden._id);
      const data = await machineryService.findAll(propertyId);
      console.log('All machinery fetched:', data);
      
      const workId = selectedOrden.id || (selectedOrden as any)._id;
      console.log('Filtering machinery by workId:', workId);
      
      // Handle both array responses and paginated responses
      const allMachineryData = Array.isArray(data) ? data : (data as any)?.data || [];
      console.log('Processed machinery data:', allMachineryData);
      
      // Filter machinery that belongs to the current work and is active (state = true)
      const workMachinery = allMachineryData.filter((machine: any) => {
        const matches = machine.workId === workId && machine.state !== false;
        console.log(`Machinery ${machine.id} - workId: ${machine.workId}, state: ${machine.state}, matches: ${matches}`);
        return matches;
      });
      
      console.log('Filtered machinery for this order:', workMachinery);
      setMachinery(workMachinery);
    } catch (error) {
      console.error("Error loading machinery:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las maquinarias",
        variant: "destructive",
      });
    }
  };

  // Function to fetch products data for the current work
  const fetchProducts = async () => {
    if (!selectedOrden) {
      console.log('No selected orden, skipping fetchProducts');
      return;
    }
    
    try {
      console.log('Fetching products for order:', selectedOrden?.id || selectedOrden._id);
      const data = await productService.findAll();
      console.log('All products fetched:', data);
      
      const workId = selectedOrden.id || (selectedOrden as any)._id;
      console.log('Filtering products by workId:', workId);
      
      // Handle both array responses and paginated responses
      const allProductsData = Array.isArray(data) ? data : (data as any)?.data || [];
      console.log('Processed products data:', allProductsData);
      
      // Filter products that belong to the current work
      const workProducts = allProductsData.filter((product: any) => {
        const matches = product.workId === workId;
        console.log(`Product ${product._id} - workId: ${product.workId}, matches: ${matches}`);
        return matches;
      });
      
      console.log('Filtered products for this order:', workProducts);
      setProducts(workProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    }
  };

  // Function to handle responsible change
  // const handleResponsibleChange = (responsibleType: string, workerId: string, formSetValue: any) => {
  //   console.log(`${responsibleType} changed to:`, workerId);
    
  //   // Find the selected worker
  //   const selectedWorker = workerList.find(worker => worker._id === workerId);
    
  //   if (selectedWorker && formSetValue) {
  //     const workerName = `${selectedWorker.names} ${selectedWorker.lastName}`;
      
  //     // Update both userId and name fields
  //     if (responsibleType === 'supervisor') {
  //       formSetValue('responsibles.supervisor.userId', workerId);
  //       formSetValue('responsibles.supervisor.name', workerName);
  //     } else if (responsibleType === 'planner') {
  //       formSetValue('responsibles.planner.userId', workerId);
  //       formSetValue('responsibles.planner.name', workerName);
  //     } else if (responsibleType === 'technicalVerifier') {
  //       formSetValue('responsibles.technicalVerifier.userId', workerId);
  //       formSetValue('responsibles.technicalVerifier.name', workerName);
  //     } else if (responsibleType === 'applicator') {
  //       formSetValue('responsibles.applicators.0.userId', workerId);
  //       formSetValue('responsibles.applicators.0.name', workerName);
  //     }
      
  //     console.log(`Set ${responsibleType} to:`, { userId: workerId, name: workerName });
  //   }
  // };

  // Function to fetch worker list for selectable dropdown
  const fetchWorkerList = async () => {
    try {
      console.log('Fetching worker list for selectable dropdown...');
      
      // Using real service to fetch worker data
      const data = await workerListService.findAll();
      console.log('Fetched worker list:', data);
      
      setWorkerList(data);
    } catch (error) {
      console.error("Error loading worker list:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar la lista de trabajadores",
        variant: "destructive",
      });
    }
  };

  // Function to fetch machinery list for selectable dropdown
  const fetchMachineryList = async () => {
    try {
      console.log('Fetching machinery list for selectable dropdown...');
      
      // Using real service to fetch machinery data
      const data = await listaMaquinariasService.findAll();
      console.log('Fetched machinery list:', data);
      
      setMachineryList(data);
    } catch (error) {
      console.error("Error loading machinery list:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar la lista de maquinarias",
        variant: "destructive",
      });
    }
  };

  // Render action buttons for each row
  const renderActions = (row: IWork) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleVoidOrden(row.id || row._id || '')}
          title="Anular"
          disabled={row.workState === "void"}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  };

  // Calculate statistics based on work states
  const calculateStatistics = () => {
    const stats = {
      total: ordenesAplicacion.length,
      confirmed: ordenesAplicacion.filter(orden => orden.workState === 'confirmed').length,
      pending: ordenesAplicacion.filter(orden => orden.workState === 'pending').length,
      void: ordenesAplicacion.filter(orden => orden.workState === 'void').length,
      blocked: ordenesAplicacion.filter(orden => orden.workState === 'blocked').length,
    };
    return stats;
  };

  const stats = calculateStatistics();

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Content Container - Removido padding extra ya que App.tsx maneja el spacing */}
      {/* Header Section - Simplificado para trabajar con el breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-shrink-0">
          <p className="text-muted-foreground">
            Gestione y monitoree las órdenes de aplicación de productos
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-2 mr-4">
              <Button
                variant={showMap ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2"
                title={showMap ? "Ocultar mapa" : "Mostrar mapa"}
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {showMap ? "Ocultar" : "Mostrar"} Mapa
                </span>
              </Button>
              <Button
                variant={showGantt ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGantt(!showGantt)}
                className="flex items-center gap-2"
                title={showGantt ? "Ocultar cronograma" : "Mostrar cronograma"}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {showGantt ? "Ocultar" : "Mostrar"} Gantt
                </span>
              </Button>
              <Button
                variant={showActivity ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActivity(!showActivity)}
                className="flex items-center gap-2"
                title={showActivity ? "Ocultar actividad" : "Mostrar actividad"}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {showActivity ? "Ocultar" : "Mostrar"} Actividad
                </span>
              </Button>
          </div>
          <div>
              {/* Action Buttons */}
              {/* <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button> */}
              <SplitButton
                options={ingresoOptions}
                onOptionSelect={handleIngresoOptionSelect}
                defaultOption={ingresoOptions[0]}
                className="flex items-center"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Orden</span>
              </SplitButton>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-muted-foreground font-medium"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Total Órdenes
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div 
                className="font-bold text-foreground"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize['2xl'] }}
              >
                {stats.total}
              </div>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
              >
                Órdenes registradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-muted-foreground font-medium"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Confirmadas
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div 
                className="font-bold text-green-600"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize['2xl'] }}
              >
                {stats.confirmed}
              </div>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
              >
                {stats.total > 0 ? `${((stats.confirmed / stats.total) * 100).toFixed(1)}%` : '0%'} del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-muted-foreground font-medium"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Pendientes
              </CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div 
                className="font-bold text-amber-600"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize['2xl'] }}
              >
                {stats.pending}
              </div>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
              >
                {stats.total > 0 ? `${((stats.pending / stats.total) * 100).toFixed(1)}%` : '0%'} del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-muted-foreground font-medium"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Bloqueadas
              </CardTitle>
              <Ban className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div 
                className="font-bold text-red-600"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize['2xl'] }}
              >
                {stats.blocked}
              </div>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
              >
                {stats.total > 0 ? `${((stats.blocked / stats.total) * 100).toFixed(1)}%` : '0%'} del total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle 
                className="text-muted-foreground font-medium"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Nulas
              </CardTitle>
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div 
                className="font-bold text-muted-foreground"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize['2xl'] }}
              >
                {stats.void}
              </div>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
              >
                {stats.total > 0 ? `${((stats.void / stats.total) * 100).toFixed(1)}%` : '0%'} del total
              </p>
            </CardContent>
          </Card>
      </div>

        {/* 3. GANTT CHART SECTION - Full Width Chronogram */}
        {showGantt && (
          <div 
            className="bg-background rounded-lg shadow-sm border border-border p-6 transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden"
            style={{ 
              minHeight: LAYOUT_CONSTANTS.gantt.minHeight,
              marginBottom: LAYOUT_CONSTANTS.gantt.marginBottom 
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 
                  className="font-semibold text-foreground"
                  style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xl }}
                >
                  Cronograma de Órdenes
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGantt(false)}
                className="text-muted-foreground"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
            <GanttChart 
              tasks={ganttTasks}
              height="400px"
              showViewModeSelector={true}
              onTaskClick={(task) => {
                console.log('Tarea seleccionada:', task);
                const fullOrder = ordenesAplicacion.find(orden => 
                  (orden._id || orden.id) === task.id
                );
                if (fullOrder) {
                  setSelectedOrden(fullOrder);
                  setIsEditMode(true);
                  setIsDialogOpen(true);
                }
              }}
            />
          </div>
        )}

        {/* 4. BOTTOM SECTION - Map & Activity Side by Side */}
        {(showMap || showActivity) && (
          <div 
            className={`grid w-full max-w-full ${
              showMap && showActivity 
                ? "grid-cols-1 lg:grid-cols-2" 
                : "grid-cols-1"
            }`}
            style={{ 
              gap: LAYOUT_CONSTANTS.bottomSection.gap,
              marginBottom: LAYOUT_CONSTANTS.bottomSection.marginBottom 
            }}
          >
            {/* Map Section */}
            {showMap && (
              <div className="bg-background rounded-lg shadow-sm border border-border p-6 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Map className="h-6 w-6 text-primary" />
                    <h2 
                      className="font-semibold text-foreground"
                      style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xl }}
                    >
                      Mapa Georeferenciado
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(false)}
                    className="text-muted-foreground"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
                <div style={{ minHeight: LAYOUT_CONSTANTS.map.minHeight }}>
                  <MapView 
                    locations={mapLocations}
                    height="320px"
                    onMarkerClick={(location) => {
                      console.log('Marcador seleccionado:', location);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Activity/Others Section */}
            {showActivity && (
              <div className="bg-background rounded-lg shadow-sm border border-border p-6 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h2 
                      className="font-semibold text-foreground"
                      style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xl }}
                    >
                      Actividad Reciente
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowActivity(false)}
                    className="text-muted-foreground"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
                <div style={{ minHeight: LAYOUT_CONSTANTS.map.minHeight }}>
                  <div className="space-y-4">
                    {/* Recent Activity Items */}
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p 
                          className="font-medium text-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
                        >
                          Orden #{ordenesAplicacion[0]?.orderNumber || 'N/A'} confirmada
                        </p>
                        <p 
                          className="text-muted-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
                        >
                          Hace 2 horas
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div className="flex-1">
                        <p 
                          className="font-medium text-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
                        >
                          {stats.pending} órdenes pendientes de revisión
                        </p>
                        <p 
                          className="text-muted-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
                        >
                          Requieren atención
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p 
                          className="font-medium text-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
                        >
                          Eficiencia: {stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : 0}%
                        </p>
                        <p 
                          className="text-muted-foreground"
                          style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
                        >
                          Órdenes completadas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. DATA GRID SECTION */}
        <div className="bg-background rounded-lg shadow-sm border border-border w-full max-w-full overflow-hidden">
          <div 
            className="flex items-center justify-between border-b border-border"
            style={{ padding: LAYOUT_CONSTANTS.header.padding }}
          >
            <div>
              <h2 
                className="font-semibold text-foreground"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xl }}
              >
                Órdenes de Aplicación
              </h2>
              <p 
                className="text-muted-foreground mt-1"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Gestione y monitoree las órdenes de aplicación de productos
              </p>
            </div>
          </div>
          <div 
            style={{ 
              minHeight: LAYOUT_CONSTANTS.grid.minHeight,
              padding: DESIGN_TOKENS.spacing.lg 
            }}
          >
            <Grid
              columns={ordersGridcolumns}
              data={ordenesAplicacion}
              actions={renderActions}
              gridId="orden-aplicacion-grid"
              title=""
            />
          </div>
        </div>
     

      {/* DIALOG - Form Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden w-[95vw]">
          <DialogHeader>
            <DialogTitle 
              style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xl }}
            >
              {isEditMode 
                ? "Editar Orden de Aplicación" 
                : formType === "wizard" 
                  ? "Nueva Orden de Aplicación" 
                  : "Nueva Orden de Aplicación"}
            </DialogTitle>
            <DialogDescription 
              style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
            >
              {isEditMode
                ? "Actualice los detalles de la orden de aplicación existente"
                : formType === "wizard"
                  ? "Siga los pasos para crear una nueva orden de aplicación"
                  : "Complete el formulario para crear una nueva orden de aplicación"}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full max-w-full overflow-hidden">
            {formType === "wizard" && !isEditMode ? (
              <WizardOrdenAplicacion
                onComplete={handleWizardComplete}
                onCancel={() => setIsDialogOpen(false)}
                defaultValues={{
                  workType: "A", // Default to Application type
                  ppe: {
                    gloves: true,
                    applicatorSuit: true,
                    respirator: true,
                    faceShield: true,
                    protectiveShoes: true,
                    other: ""
                  },
                  climateConditions: "",
                  windSpeed: "",
                  temperature: "",
                  humidity: "",
                  observation: "",
                  observationApp: "",
                  syncApp: false,
                  appUser: "",
                  workState: "pending",
                  responsibles: {
                    supervisor: { userId: "" },
                    planner: { userId: "" },
                    technicalVerifier: { userId: "" },
                    applicators: [{ userId: "" }]
                  }
                }}
                // Pass raw data arrays (preferred for consistent rules)
                cuarteles={cuarteles}
                allTasks={allTasks}
                taskTypes={taskTypes}
                workerList={workerList}
                // Keep legacy options for backward compatibility
                {...getWizardOptions()}
              />
            ) : (
              <DynamicForm
              enabledButtons={false}
              fieldRules={mainFormRules}
              sections={formSections.map(section => {
              if (section.id === "orden-info-basic") {
                return {
                  ...section,
                  fields: section.fields.map(field => {
                    if (field.id === "barracks") {
                      console.log("Rendering barracks select with options:", cuarteles);
                      return {
                        ...field,
                        options: cuarteles.map(cuartel => {
                          const value = cuartel._id;
                          console.log(`Cuartel option: ${cuartel.areaName} (${value})`);
                          return {
                            value: value,
                            label: cuartel.areaName
                          };
                        })
                        // onChange removido - ahora manejado por fieldRules
                      };
                    }
                    if (field.id === "species" || field.id === "variety") {
                      return {
                        ...field,
                        disabled: true
                        // value removido - ahora manejado por fieldRules
                      };
                    }
                    return field;
                  })
                };
              }
              if (section.id === "orden-info-task") {
                return {
                  ...section,
                  fields: section.fields.map(field => {
                    if (field.id === "taskType") {
                      console.log("Rendering taskType select with options:", taskTypes);
                      return {
                        ...field,
                        options: taskTypes.map(type => {
                          const value = type._id || (type as any).id;
                          console.log(`TaskType option: ${type.name} (${value})`);
                          return {
                            value: value,
                            label: type.name
                          };
                        })
                        // onChange removido - ahora manejado por fieldRules
                      };
                    }
                    if (field.id === "task") {
                      console.log("🔧 Rendering task select with options:", filteredTasks.length, 'filteredTasks');
                      console.log("🔧 FilteredTasks array:", filteredTasks);
                      return {
                        ...field,
                        key: `task-field-${filteredTasks.length}-${selectedTaskType}`, // Force re-render
                        options: filteredTasks.map(task => {
                          const value = (task as any)._id || (task as any).id;
                          console.log(`🔧 Task option: ${task.taskName} (${value})`);
                          return {
                            value: value,
                            label: task.taskName
                          };
                        })
                        // onChange removido - ahora manejado por fieldRules
                      };
                    }
                    return field;
                  })
                };
              }
              if (section.id === "orden-info-responsibles") {
                return {
                  ...section,
                  fields: section.fields.map(field => {
                    const workerOptions = workerList.map(worker => ({
                      value: worker._id || "",
                      label: `${worker.names} ${worker.lastName} (${worker.rut})`
                    }));

                    if (field.id === "responsibles.supervisor.userId") {
                      return { ...field, options: workerOptions };
                    }
                    if (field.id === "responsibles.planner.userId") {
                      return { ...field, options: workerOptions };
                    }
                    if (field.id === "responsibles.technicalVerifier.userId") {
                      return { ...field, options: workerOptions };
                    }
                    if (field.id === "responsibles.applicators.0.userId") {
                      return { ...field, options: workerOptions };
                    }
                    // onChange removido de todos los responsibles - ahora manejado por fieldRules
                    return field;
                  })
                };
              }
              return section;
            })}
            validationSchema={orderFormValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedOrden 
              ? { 
                  ...selectedOrden,
                  taskType: selectedOrden.taskType || "",
                  task: selectedOrden.task && typeof selectedOrden.task === 'object' 
                    ? (selectedOrden.task as any).id || (selectedOrden.task as any)._id || ""
                    : selectedOrden.task || ""
                } 
              : {
                  workType: "A", // Default to Application type
                  ppe: {
                    gloves: true,
                    applicatorSuit: true,
                    respirator: true,
                    faceShield: true,
                    apron: true,
                    boots: true,
                    noseMouthProtector: true
                  },
                  rowNumber: "",
                  taskType: "",
                  task: "",
                  calibrationPerHectare: 0,
                  taskOptimalYield: 0,
                  initialBonusToWorkers: 0,
                  taskPrice: 0,
                  responsibles: {
                    supervisor: { userId: "", name: "" },
                    planner: { userId: "", name: "" },
                    technicalVerifier: { userId: "", name: "" },
                    applicators: [{ userId: "", name: "" }]
                  },
                  washing: {
                    suit1: false,
                    suit2: false,
                    suit3: false,
                    filterHolder1: false,
                    filterHolder2: false,
                    filterHolder3: false,
                    tripleWash: false,
                    machinery: false,
                    leftovers: false,
                    leftoverObservation: false
                  }
                }
            }
          />
            )}
          </div>
          
          {/* Workers section - only visible in edit mode */}
          {isEditMode && selectedOrden && (
            <div 
              className="mt-6 border border-border rounded-lg p-4 w-full max-w-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-medium text-foreground"
                  style={{ fontSize: DESIGN_TOKENS.typography.fontSize.lg }}
                >
                  Trabajadores
                </h3>
              </div>
              
              {/* Workers grid */}
              <FormGrid
                key={`workers-grid-${selectedOrden._id || selectedOrden.id}`}
                columns={workersColumns}
                data={workers.map((worker, index) => ({
                  ...worker,
                  _id: worker._id || `worker-${index}-${Date.now()}`
                }))}
                idField="_id"
                editValidationSchema={workerFormSchema}
                addValidationSchema={workerFormSchema}
                actions={(row: IWorkers) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        console.log('Deleting worker:', (row as any)._id);
                        await workerService.softDeleteWorker((row as any)._id);
                        console.log('Worker deleted successfully');
                        
                        toast({
                          title: "Éxito",
                          description: "Trabajador eliminado correctamente",
                        });
                        
                        console.log('Refreshing workers list after deletion...');
                        await fetchWorkers();
                      } catch (error) {
                        console.error('Error deleting worker:', error);
                        toast({
                          title: "Error",
                          description: "No se pudo eliminar el trabajador",
                          variant: "destructive",
                        });
                      }
                    }}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                gridId={`workers-grid-${selectedOrden._id || selectedOrden.id}`}
                title="Listado de Trabajadores"
                enableInlineEdit={true}
                editableColumns={[
                  "worker", "classification", "quadrille", "workingDay", 
                  "paymentMethod", "contractor", "date", "salary", "yield", 
                  "totalHoursYield", "yieldValue", "overtime", "bonus", 
                  "additionalBonuses", "dayValue", "totalDeal", "dailyTotal", 
                  "value", "exportPerformance", "juicePerformance", "othersPerformance", "state"
                ]}
                fieldRules={workerGridRules}
                fieldConfigurations={{
                  worker: {
                    type: 'select',
                    placeholder: "Seleccionar trabajador",
                    style: { minWidth: '150px' },
                    options: workerList
                      .filter(worker => worker._id) // Solo incluir workers con _id válido
                      .map((worker) => ({
                        value: worker._id,
                        label: `${worker.names} ${worker.lastName} (${worker.rut})`
                      }))
                  },    
                  classification: {
                    type: 'text',
                    placeholder: "Clasificación del trabajador",
                    style: { minWidth: '120px' }
                  },
                  quadrille: {
                    type: 'text',
                    placeholder: "Cuadrilla",
                    style: { minWidth: '80px' }
                  },
                  workingDay: {
                    type: 'number',
                    placeholder: "1.0",
                    min: 0,
                    max: 99,
                    step: 0.1,
                    style: { minWidth: '70px' }
                  },
                  paymentMethod: {
                    type: 'select',
                    placeholder: "Método de pago",
                    style: { minWidth: '130px' },
                    options: [
                      { value: "trato", label: "Trato" },
                      { value: "trato-dia", label: "Trato + Día" },
                      { value: "dia-laboral", label: "Día laboral" },
                      { value: "mayor-trato-dia", label: "Mayor entre trato o día laboral" },
                      { value: "trato-dia-laboral", label: "Trato - dia laboral" },
                      { value: "ajuste-septimodia", label: "Ajuste al 7mo día" }

                    ]
                  },
                  contractor: {
                    type: 'text',
                    placeholder: "Contratista",
                    style: { minWidth: '100px' }
                  },
                  date: {
                    type: 'date',
                    style: { minWidth: '120px' }
                  },
                  salary: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  yield: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  totalHoursYield: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  yieldValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  overtime: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  bonus: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  additionalBonuses: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  dayValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  totalDeal: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  dailyTotal: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  value: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  exportPerformance: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  juicePerformance: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  othersPerformance: {
                    type: 'number',
                    min: 0,
                    placeholder: "0",
                    style: { minWidth: '80px' }
                  },
                  state: {
                    type: 'checkbox',
                    style: { minWidth: '50px' }
                  }
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  try {
                    console.log('Saving worker edit:', { originalRow, updatedRow });
                    // Convert numeric fields to strings as expected by IWorkers interface
                    const workerData = {
                      ...updatedRow,
                      salary: String(updatedRow.salary || 0),
                      yield: String(updatedRow.yield || 0),
                      totalHoursYield: String(updatedRow.totalHoursYield || 0),
                      yieldValue: String(updatedRow.yieldValue || 0),
                      overtime: String(updatedRow.overtime || 0),
                      bonus: String(updatedRow.bonus || 0),
                      additionalBonuses: String(updatedRow.additionalBonuses || 0),
                      dayValue: String(updatedRow.dayValue || 0),
                      totalDeal: String(updatedRow.totalDeal || 0),
                      dailyTotal: String(updatedRow.dailyTotal || 0),
                      value: String(updatedRow.value || 0),
                      exportPerformance: String(updatedRow.exportPerformance || 0),
                      juicePerformance: String(updatedRow.juicePerformance || 0),
                      othersPerformance: String(updatedRow.othersPerformance || 0),
                    };
                    await workerService.updateWorker(originalRow._id, workerData);
                    await fetchWorkers();
                  } catch (error) {
                    console.error('Error updating worker:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
                onEditStart={(row) => {
                  console.log('Starting edit for worker:', row);
                }}
                onEditCancel={(row) => {
                  console.log('Cancelled edit for worker:', row);
                }}
                enableInlineAdd={true}
                defaultNewRow={{
                  classification: "",
                  worker: "",
                  quadrille: "",
                  workingDay: "",
                  paymentMethod: "",
                  contractor: "",
                  date: new Date().toISOString().split('T')[0],
                  salary: 0,
                  yield: 0,
                  totalHoursYield: 0,
                  yieldValue: 0,
                  overtime: 0,
                  bonus: 0,
                  additionalBonuses: 0,
                  dayValue: 0,
                  totalDeal: 0,
                  dailyTotal: 0,
                  value: 0,
                  exportPerformance: 0,
                  juicePerformance: 0,
                  othersPerformance: 0,
                  workId: selectedOrden ? String(selectedOrden.id || (selectedOrden as any)._id) : "",
                  state: true
                }}
                addableColumns={[
                  "worker", "classification", "quadrille", "workingDay", 
                  "paymentMethod", "contractor", "date", "salary", "yield", 
                  "totalHoursYield", "yieldValue", "overtime", "bonus", 
                  "additionalBonuses", "dayValue", "totalDeal", "dailyTotal", 
                  "value", "exportPerformance", "juicePerformance", "othersPerformance", "state"
                ]}
                onInlineAdd={async (newWorker: WorkerFormData) => {
                  try {
                    if (!selectedOrden) {
                      throw new Error("No hay una orden seleccionada");
                    }

                    const workId = selectedOrden.id || (selectedOrden as any)._id;
                    // Convert numeric fields to numbers for WorkerFormData and then to strings for IWorkers
                    const workerData = {
                      ...newWorker,
                      workId: String(workId),
                      state: true,
                      salary: Number(newWorker.salary || 0),
                      yield: Number(newWorker.yield || 0),
                      totalHoursYield: Number(newWorker.totalHoursYield || 0),
                      yieldValue: Number(newWorker.yieldValue || 0),
                      overtime: Number(newWorker.overtime || 0),
                      bonus: Number(newWorker.bonus || 0),
                      additionalBonuses: Number(newWorker.additionalBonuses || 0),
                      dayValue: Number(newWorker.dayValue || 0),
                      totalDeal: Number(newWorker.totalDeal || 0),
                      dailyTotal: Number(newWorker.dailyTotal || 0),
                      value: Number(newWorker.value || 0),
                      exportPerformance: Number(newWorker.exportPerformance || 0),
                      juicePerformance: Number(newWorker.juicePerformance || 0),
                      othersPerformance: Number(newWorker.othersPerformance || 0),
                    };
                    
                    console.log('Adding new worker:', workerData);
                    await workerService.createWorker(workerData as any);
                    await fetchWorkers();
                  } catch (error) {
                    console.error('Error adding worker:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
              />
            </div>
          )}
          
          {/* Machinery section - only visible in edit mode */}
          {isEditMode && selectedOrden && (
            <div 
              className="mt-6 border border-border rounded-lg p-4 w-full max-w-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-medium text-foreground"
                  style={{ fontSize: DESIGN_TOKENS.typography.fontSize.lg }}
                >
                  Maquinaria
                </h3>
              </div>
              
              {/* Machinery grid */}
              <FormGrid
                key={`machinery-grid-${selectedOrden._id || selectedOrden.id}`}
                columns={machineryColumns}
                data={machinery.map((machine, index) => ({
                  ...machine,
                  _id: (machine as any)._id || (machine as any).id || `machinery-${index}-${Date.now()}`
                }))}
                idField="_id"
                editValidationSchema={machineryFormSchema}
                addValidationSchema={machineryFormSchema}
                actions={(row: IMachinery) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        console.log('Deleting machinery:', (row as any)._id);
                        await machineryService.softDeleteMachinery((row as any)._id || '');
                        console.log('Machinery deleted successfully');
                        
                        toast({
                          title: "Éxito",
                          description: "Maquinaria eliminada correctamente",
                        });
                        
                        console.log('Refreshing machinery list after deletion...');
                        await fetchMachinery();
                      } catch (error) {
                        console.error('Error deleting machinery:', error);
                        toast({
                          title: "Error",
                          description: "No se pudo eliminar la maquinaria",
                          variant: "destructive",
                        });
                      }
                    }}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                gridId={`machinery-grid-${selectedOrden._id || selectedOrden.id}`}
                title="Listado de Maquinaria"
                enableInlineEdit={true}
                editableColumns={[
                  "machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"
                ]}
                fieldRules={machineryGridRules}
                fieldConfigurations={{
                  machinery: {
                    type: 'select',
                    placeholder: "Seleccionar maquinaria",
                    style: { minWidth: '200px' },
                    options: machineryList
                      .filter(machine => machine._id) // Solo incluir machinery con _id válido
                      .map((machine) => ({
                        value: machine._id,
                        label: `${machine.equipment} - ${machine.machineryCode} (${machine.brand})`
                      }))
                  },
                  startTime: {
                    type: 'time'
                  },
                  endTime: {
                    type: 'time'
                  },
                  finalHours: {
                    type: 'text',
                    placeholder: "Horas finales"
                  },
                  timeValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  totalValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  }
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  try {
                    console.log('Saving machinery edit:', { originalRow, updatedRow });
                    // Convert numeric fields to strings as expected by IMachinery interface
                    const machineryData = {
                      ...updatedRow,
                      timeValue: String(updatedRow.timeValue || 0),
                      totalValue: String(updatedRow.totalValue || 0),
                    };
                    await machineryService.updateMachinery((originalRow as any)._id, machineryData);
                    await fetchMachinery();
                  } catch (error) {
                    console.error('Error updating machinery:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
                onEditStart={(row) => {
                  console.log('Starting edit for machinery:', row);
                }}
                onEditCancel={(row) => {
                  console.log('Cancelled edit for machinery:', row);
                }}
                enableInlineAdd={true}
                defaultNewRow={{
                  machinery: "",
                  startTime: "",
                  endTime: "",
                  finalHours: "",
                  timeValue: 0,
                  totalValue: 0,
                  workId: selectedOrden ? String(selectedOrden.id || (selectedOrden as any)._id) : "",
                }}
                addableColumns={[
                  "machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"
                ]}
                onInlineAdd={async (newMachinery: MachineryFormData) => {
                  try {
                    if (!selectedOrden) {
                      throw new Error("No hay una orden seleccionada");
                    }

                    const workId = selectedOrden.id || (selectedOrden as any)._id;
                    // Convert numeric fields to strings as expected by IMachinery interface
                    const machineryData = {
                      ...newMachinery,
                      workId: String(workId),
                      timeValue: String(newMachinery.timeValue || 0),
                      totalValue: String(newMachinery.totalValue || 0),
                    };
                    
                    console.log('Adding new machinery:', machineryData);
                    await machineryService.createMachinery(machineryData);
                    await fetchMachinery();
                  } catch (error) {
                    console.error('Error adding machinery:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
              />
            </div>
          )}
          
          {/* Products section - only visible in edit mode */}
          {isEditMode && selectedOrden && (
            <div 
              className="mt-6 border border-border rounded-lg p-4 w-full max-w-full overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-medium text-foreground"
                  style={{ fontSize: DESIGN_TOKENS.typography.fontSize.lg }}
                >
                  Productos
                </h3>
              </div>
              
              {/* Products grid */}
              <FormGrid
                key={`products-grid-${selectedOrden._id || selectedOrden.id}`}
                columns={productsColumns}
                data={products.map((product, index) => ({
                  ...product,
                  _id: (product as any)._id || (product as any).id || `product-${index}-${Date.now()}`
                }))}
                idField="_id"
                editValidationSchema={productFormSchema}
                addValidationSchema={productFormSchema}
                actions={(row: IProducts) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        console.log('Deleting product:', (row as any)._id);
                        await productService.deleteProduct((row as any)._id || '');
                        console.log('Product deleted successfully');
                        
                        toast({
                          title: "Éxito",
                          description: "Producto eliminado correctamente",
                        });
                        
                        console.log('Refreshing products list after deletion...');
                        await fetchProducts();
                      } catch (error) {
                        console.error('Error deleting product:', error);
                        toast({
                          title: "Error",
                          description: "No se pudo eliminar el producto",
                          variant: "destructive",
                        });
                      }
                    }}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                gridId={`products-grid-${selectedOrden._id || selectedOrden.id}`}
                title="Listado de Productos"
                enableInlineEdit={true}
                editableColumns={[
                  "category", "product", "unitOfMeasurement", "amountPerHour", 
                  "amount", "netUnitValue", "totalValue", "return", "machineryRelationship", "packagingCode", "invoiceNumber"
                ]}
                fieldConfigurations={{
                  category: {
                    type: 'text',
                    placeholder: "Categoría",
                    readonly: true,
                    style: { 
                      backgroundColor: '#f5f5f5', 
                      color: '#666',
                      cursor: 'not-allowed' 
                    }

                  },
                  product: {
                    type: 'custom',
                    placeholder: "Seleccionar producto",
                    customRender: (field: any, config: any, handleChange: (value: any) => void) => (
                      <div className="relative">
                        <input
                          type="text"
                          value={field.value || ""}
                          placeholder={config.placeholder}
                          readOnly
                          onClick={() => handleProductModalOpen(field)}
                          className="h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-4 w-4 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    )
                  },
                  unitOfMeasurement: {
                    type: 'text',
                    placeholder: "Unidad de medida",
                    readonly: true,
                    style: { 
                      backgroundColor: '#f5f5f5', 
                      color: '#666',
                      cursor: 'not-allowed' 
                    }
                  },
                  amountPerHour: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  amount: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  netUnitValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  totalValue: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  return: {
                    type: 'number',
                    min: 0,
                    placeholder: "0"
                  },
                  machineryRelationship: {
                    type: 'select',
                    placeholder: "Seleccionar maquinaria",
                    style: { minWidth: '200px' },
                    options: machineryList
                      .filter(machine => machine._id) // Solo incluir machinery con _id válido
                      .map((machine) => ({
                        value: machine._id,
                        label: `${machine.equipment} - ${machine.machineryCode} (${machine.brand})`
                      }))
                  },
                  packagingCode: {
                    type: 'text',
                    placeholder: "Código de envase"
                  },
                  invoiceNumber: {
                    type: 'text',
                    placeholder: "Número de factura"
                  }
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  try {
                    console.log('Saving product edit:', { originalRow, updatedRow });
                    // Convert numeric fields to strings as expected by IProducts interface
                    const productData = {
                      ...updatedRow,
                      amountPerHour: String(updatedRow.amountPerHour || 0),
                      amount: String(updatedRow.amount || 0),
                      netUnitValue: String(updatedRow.netUnitValue || 0),
                      totalValue: String(updatedRow.totalValue || 0),
                      return: String(updatedRow.return || 0),
                    };
                    await productService.updateProduct((originalRow as any)._id, productData);
                    await fetchProducts();
                  } catch (error) {
                    console.error('Error updating product:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
                onEditStart={(row) => {
                  console.log('Starting edit for product:', row);
                }}
                onEditCancel={(row) => {
                  console.log('Cancelled edit for product:', row);
                }}
                enableInlineAdd={true}
                defaultNewRow={{
                  category: "",
                  product: "",
                  unitOfMeasurement: "",
                  amountPerHour: 0,
                  amount: 0,
                  netUnitValue: 0,
                  totalValue: 0,
                  return: 0,
                  machineryRelationship: "",
                  packagingCode: "",
                  invoiceNumber: "",
                  workId: selectedOrden ? String(selectedOrden.id || (selectedOrden as any)._id) : "",
                }}
                addableColumns={[
                  "category", "product", "unitOfMeasurement", "amountPerHour", 
                  "amount", "netUnitValue", "totalValue", "return", "machineryRelationship", "packagingCode", "invoiceNumber"
                ]}
                onInlineAdd={async (newProduct: ProductFormData) => {
                  try {
                    if (!selectedOrden) {
                      throw new Error("No hay una orden seleccionada");
                    }

                    const workId = selectedOrden.id || (selectedOrden as any)._id;
                    // Convert numeric fields to strings as expected by IProducts interface
                    const productData = {
                      ...newProduct,
                      workId: String(workId),
                      machineryRelationship: newProduct.machineryRelationship || "",
                      amountPerHour: String(newProduct.amountPerHour || 0),
                      amount: String(newProduct.amount || 0),
                      netUnitValue: String(newProduct.netUnitValue || 0),
                      totalValue: String(newProduct.totalValue || 0),
                      return: String(newProduct.return || 0),
                    };
                    
                    console.log('Adding new product:', productData);
                    await productService.createProduct(productData);
                    await fetchProducts();
                  } catch (error) {
                    console.error('Error adding product:', error);
                    throw error; // Let FormGrid handle the error notification
                  }
                }}
              />
            </div>
          )}
          
          {formType !== "wizard" && (
            <DialogFooter 
              className="mt-6 px-4"
            >
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                form="dynamic-form"
                style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm }}
              >
                {isEditMode ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setCurrentProductField(null);
        }}
        onSelect={handleProductSelect}
        products={filteredWarehouseProducts}
        title="Seleccionar Producto"
        description="Busca y selecciona un producto para agregar al registro"
      />
    </div>
  );
};

export default OrdenAplicacion; 