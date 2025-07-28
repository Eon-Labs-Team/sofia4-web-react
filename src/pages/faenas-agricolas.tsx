import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Save,
  X
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IWork } from "@eon-lib/eon-mongoose";
import { IWorkers } from "@eon-lib/eon-mongoose";
import { IMachinery } from "@eon-lib/eon-mongoose";
import { IProducts } from "@eon-lib/eon-mongoose";
import { ITaskType } from "@eon-lib/eon-mongoose";
import { ITask } from "@eon-lib/eon-mongoose";
import workService from "@/_services/workService";
import workerService from "@/_services/workerService";
import machineryService from "@/_services/machineryService";
import productService from "@/_services/productService";
import faenaService from "@/_services/faenaService";
import laborService from "@/_services/laborService";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <XCircle className="h-4 w-4 text-gray-500 mr-2" />
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

// Column configuration for the grid
const columns: Column[] = [
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

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Faena: {row.orderNumber}</h3>
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

// Form configuration for adding new faena agrícola
const formSections: SectionConfig[] = [
  {
    id: "faena-info-basic",
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
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true
      },
      {
        id: "species",
        type: "text",
        label: "Especie",
        name: "species",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Ej: Fuji, Bartlett, Cabernet",
        required: true
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
    id: "faena-info-detail",
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
    id: "faena-info-task",
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
    id: "faena-info-payment",
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
        type: "text",
        label: "Método de Pago a Trabajadores",
        name: "paymentMethodToWorkers",
        placeholder: "Método de pago a trabajadores"
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
    id: "faena-info-dates",
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
    id: "faena-info-climate",
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
    id: "faena-info-app",
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
    id: "faena-info-responsibles",
    title: "Responsables",
    fields: [
      {
        id: "responsibles.supervisor.userId",
        type: "text",
        label: "ID Supervisor",
        name: "responsibles.supervisor.userId",
        placeholder: "ID del supervisor"
      },
      {
        id: "responsibles.supervisor.name",
        type: "text",
        label: "Nombre Supervisor",
        name: "responsibles.supervisor.name",
        placeholder: "Nombre del supervisor"
      },
      {
        id: "responsibles.planner.userId",
        type: "text",
        label: "ID Planificador",
        name: "responsibles.planner.userId",
        placeholder: "ID del planificador"
      },
      {
        id: "responsibles.planner.name",
        type: "text",
        label: "Nombre Planificador",
        name: "responsibles.planner.name",
        placeholder: "Nombre del planificador"
      },
      {
        id: "responsibles.technicalVerifier.userId",
        type: "text",
        label: "ID Verificador Técnico",
        name: "responsibles.technicalVerifier.userId",
        placeholder: "ID del verificador técnico"
      },
      {
        id: "responsibles.technicalVerifier.name",
        type: "text",
        label: "Nombre Verificador Técnico",
        name: "responsibles.technicalVerifier.name",
        placeholder: "Nombre del verificador técnico"
      },
      // Nota: Los aplicadores son un array, pero por simplicidad, implementaremos un solo aplicador
      {
        id: "responsibles.applicators.0.userId",
        type: "text",
        label: "ID Aplicador Principal",
        name: "responsibles.applicators.0.userId",
        placeholder: "ID del aplicador principal"
      },
      {
        id: "responsibles.applicators.0.name",
        type: "text",
        label: "Nombre Aplicador Principal",
        name: "responsibles.applicators.0.name",
        placeholder: "Nombre del aplicador principal"
      },
    ],
  },
  {
    id: "faena-info-ppe",
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
    id: "faena-info-washing",
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
const formValidationSchema = z.object({
  workType: z.string().default("T"),
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

// Función para modificar el tipo y añadir explícitamente el _id como propiedad
interface WorkWithId extends IWork {
  _id?: string;
}

const FaenasAgricolas = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [faenasAgricolas, setFaenasAgricolas] = useState<WorkWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFaena, setSelectedFaena] = useState<WorkWithId | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Workers state
  const [workers, setWorkers] = useState<IWorkers[]>([]);
  
  // Machinery state
  const [machinery, setMachinery] = useState<IMachinery[]>([]);
  
  // State for taskTypes and tasks
  const [taskTypes, setTaskTypes] = useState<ITaskType[]>([]);
  const [allTasks, setAllTasks] = useState<ITask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  
  // Products state
  const [products, setProducts] = useState<IProducts[]>([]);
  
  // Fetch faenas on component mount
  useEffect(() => {
    fetchFaenasAgricolas();
    fetchTaskTypes();
    fetchTasks();
  }, []);
  
  // Filter tasks when taskType changes
  useEffect(() => {
    // Log data for debugging
    console.log('Selected taskType:', selectedTaskType);
    console.log('All tasks:', allTasks);
    
    if (selectedTaskType) {
      const tasksForType = allTasks.filter(task => task.taskTypeId === selectedTaskType);
      console.log('Filtered tasks:', tasksForType);
      setFilteredTasks(tasksForType);
    } else {
      // Show all tasks when no taskType is selected instead of empty array
      setFilteredTasks(allTasks);
    }
  }, [selectedTaskType, allTasks]);
  
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
  
  // Function to handle taskType change
  const handleTaskTypeChange = (taskTypeId: string) => {
    setSelectedTaskType(taskTypeId);
  };
  
  // Function to fetch faenas data
  const fetchFaenasAgricolas = async () => {
    setIsLoading(true);
    try {
      const data = await workService.findAll();
      // Handle both array responses and paginated responses
      const allWorksData = Array.isArray(data) ? data : (data as any)?.data || [];
      
      // Filter only works with workType === 'T' (Task/Faenas Agrícolas)
      const faenasData = allWorksData.filter((work: any) => work.workType === 'T');
      
      setFaenasAgricolas(faenasData);
      console.log('Faenas agrícolas (filtered by workType T):', faenasData);
    } catch (error) {
      console.error("Error loading faenas agrícolas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las faenas agrícolas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new faena
  const handleAddFaena = async (data: Partial<IWork>) => {
    console.log("faena agrícola", data);

    try {
      await workService.createAgriculturalWork(data);
      toast({
        title: "Éxito",
        description: "Faena agrícola creada correctamente",
      });
      fetchFaenasAgricolas();
    } catch (error) {
      console.error("Error al crear la faena agrícola:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la faena agrícola",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a faena
  const handleUpdateFaena = async (id: string | number, data: Partial<IWork>) => {
    try {
      await workService.updateWork(id, data);
      toast({
        title: "Éxito", 
        description: "Faena agrícola actualizada correctamente",
      });
      fetchFaenasAgricolas();
    } catch (error) {
      console.error(`Error al actualizar la faena agrícola ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la faena agrícola",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a faena (changing state to void)
  const handleVoidFaena = async (id: string | number) => {
    try {
      await workService.changeWorkState(id, "void");
      toast({
        title: "Éxito",
        description: "Faena agrícola anulada correctamente",
      });
      fetchFaenasAgricolas();
    } catch (error) {
      console.error(`Error al anular la faena agrícola ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo anular la faena agrícola",
        variant: "destructive",
      });
    }
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
    
    if (isEditMode && selectedFaena) {
      handleUpdateFaena(selectedFaena.id || selectedFaena._id || '', processedData);
    } else {
      handleAddFaena(processedData);
      console.log('processedData', data);
    }
    setIsDialogOpen(false);
  };

  // Function to handle edit button click
  const handleEditClick = (faena: WorkWithId) => {
    setSelectedFaena(faena);
    setIsEditMode(true);
    
    // Set the selected task type if available
    if (faena.taskType) {
      setSelectedTaskType(String(faena.taskType));
      
      // Filter tasks for this task type
      console.log('Edit mode - faena.taskType:', faena.taskType);
      const tasksForType = allTasks.filter(task => task.taskTypeId === String(faena.taskType));
      console.log('Edit mode - filtered tasks:', tasksForType);
      setFilteredTasks(tasksForType);
    }
    
    setIsDialogOpen(true);
  };

  // Workers grid columns
  const workersColumns: Column[] = [
    {
      id: "worker",
      header: "ID Trabajador",
      accessor: "worker",
      visible: true,
      sortable: true,
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
      header: "Valor",
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
      id: "category",
      header: "Categoría",
      accessor: "category",
      visible: true,
      sortable: true,
    },
    {
      id: "product",
      header: "Producto",
      accessor: "product",
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
    if (isEditMode && selectedFaena) {
      console.log('useEffect triggered for fetchWorkers:', { isEditMode, selectedFaena: selectedFaena?.id || selectedFaena?._id });
      fetchWorkers();
    }
  }, [isEditMode, selectedFaena]);

  // Additional useEffect to fetch workers when dialog opens in edit mode
  useEffect(() => {
    if (isDialogOpen && isEditMode && selectedFaena) {
      console.log('Dialog opened in edit mode, fetching workers for order:', selectedFaena?.id || selectedFaena?._id);
      fetchWorkers();
    }
  }, [isDialogOpen, isEditMode, selectedFaena]);

  // Fetch machinery on component mount and when selected order changes
  useEffect(() => {
    if (isEditMode && selectedFaena) {
      console.log('useEffect triggered for fetchMachinery:', { isEditMode, selectedFaena: selectedFaena?.id || selectedFaena?._id });
      fetchMachinery();
    }
  }, [isEditMode, selectedFaena]);

  // Fetch products on component mount and when selected order changes
  useEffect(() => {
    if (isEditMode && selectedFaena) {
      console.log('useEffect triggered for fetchProducts:', { isEditMode, selectedFaena: selectedFaena?.id || selectedFaena?._id });
      fetchProducts();
    }
  }, [isEditMode, selectedFaena]);

  // Function to fetch workers data for the current work
  const fetchWorkers = async () => {
    if (!selectedFaena) {
      console.log('No selected faena, skipping fetchWorkers');
      return;
    }
    
    try {
      console.log('Fetching workers for order:', selectedFaena?.id || selectedFaena?._id);
      const data = await workerService.findAll();
      console.log('All workers fetched:', data);
      
      const workId = selectedFaena.id || (selectedFaena as any)._id;
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
    if (!selectedFaena) {
      console.log('No selected faena, skipping fetchMachinery');
      return;
    }
    
    try {
      console.log('Fetching machinery for order:', selectedFaena?.id || selectedFaena._id);
      const data = await machineryService.findAll();
      console.log('All machinery fetched:', data);
      
      const workId = selectedFaena.id || (selectedFaena as any)._id;
      console.log('Filtering machinery by workId:', workId);
      
      // Handle both array responses and paginated responses
      const allMachineryData = Array.isArray(data) ? data : (data as any)?.data || [];
      console.log('Processed machinery data:', allMachineryData);
      
      // Filter machinery that belongs to the current work
      const workMachinery = allMachineryData.filter((machine: any) => {
        const matches = machine.workId === workId;
        console.log(`Machinery ${machine.id} - workId: ${machine.workId}, matches: ${matches}`);
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
    if (!selectedFaena) {
      console.log('No selected faena, skipping fetchProducts');
      return;
    }
    
    try {
      console.log('Fetching products for order:', selectedFaena?.id || selectedFaena._id);
      const data = await productService.findAll();
      console.log('All products fetched:', data);
      
      const workId = selectedFaena.id || (selectedFaena as any)._id;
      console.log('Filtering products by workId:', workId);
      
      // Handle both array responses and paginated responses
      const allProductsData = Array.isArray(data) ? data : (data as any)?.data || [];
      console.log('Processed products data:', allProductsData);
      
      // Filter products that belong to the current work
      const workProducts = allProductsData.filter((product: any) => {
        const matches = product.workId === workId;
        console.log(`Product ${product.id || product._id} - workId: ${product.workId}, matches: ${matches}`);
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

  // Render action buttons for each row
  const renderActions = (row: WorkWithId) => {
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
          onClick={() => handleVoidFaena(row.id || row._id || '')}
          title="Anular"
          disabled={row.workState === "void"}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Faenas Agrícolas</h1>
          <p className="text-muted-foreground">
            Gestione las faenas agrícolas y trabajos de campo
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedFaena(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Faena
        </Button>
      </div>

      <Grid
        columns={columns}
        data={faenasAgricolas}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="faenas-agricolas-grid"
        title="Faenas Agrícolas"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Faena Agrícola" : "Nueva Faena Agrícola"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles de la faena agrícola existente"
                : "Complete el formulario para crear una nueva faena agrícola"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections.map(section => {
              if (section.id === "faena-info-task") {
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
    }),
    onChange: (value: string) => {
      console.log("TaskType changed to:", value);
      handleTaskTypeChange(value);
    }
  };
}
if (field.id === "task") {
  console.log("Rendering task select with options:", filteredTasks);
  return {
    ...field,
    options: filteredTasks.map(task => {
      const value = (task as any)._id || (task as any).id;
      console.log(`Task option: ${task.taskName} (${value})`);
      return {
        value: value,
        label: task.taskName
      };
    })
  };
}
                    return field;
                  })
                };
              }
              return section;
            })}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedFaena 
              ? { 
                  ...selectedFaena,
                  taskType: selectedFaena.taskType || "",
                  task: selectedFaena.task && typeof selectedFaena.task === 'object' 
                    ? (selectedFaena.task as any).id || (selectedFaena.task as any)._id || ""
                    : selectedFaena.task || ""
                } 
              : {
                  workType: "T", // Default to Task type
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
                  task: {
                    _id: "",
                    taskTypeId: "",
                    optionalCode: "",
                    taskName: ""
                  },
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
          
          {/* Workers section - only visible in edit mode */}
          {isEditMode && selectedFaena && (
            <div className="mt-6 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Trabajadores</h3>
              </div>
              
              {/* Workers grid */}
              <Grid
                columns={workersColumns}
                data={workers}
                idField="_id"
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
                gridId="workers-grid-aplication-order"
                title="Listado de Trabajadores"
              />
            </div>
          )}
          
          {/* Machinery section - only visible in edit mode */}
          {isEditMode && selectedFaena && (
            <div className="mt-6 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Maquinaria</h3>
              </div>
              
              {/* Machinery grid */}
              <Grid
                columns={machineryColumns}
                data={machinery}
                idField="_id"
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
                gridId="machinery-grid-application-order"
                title="Listado de Maquinaria"
              />
            </div>
          )}
          
          {/* Products section - only visible in edit mode */}
          {isEditMode && selectedFaena && (
            <div className="mt-6 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Productos</h3>
              </div>
              
              {/* Products grid */}
              <Grid
                columns={productsColumns}
                data={products}
                idField="_id"
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
                gridId="products-grid-application-order"
                title="Listado de Productos"
                enableInlineEdit={true}
                editableColumns={[
                  "category", "product", "unitOfMeasurement", "amountPerHour", 
                  "amount", "netUnitValue", "totalValue", "return", "machineryRelationship", "packagingCode", "invoiceNumber"
                ]}
                onEditSave={async (originalRow, updatedRow) => {
                  try {
                    console.log('Saving product edit:', { originalRow, updatedRow });
                    await productService.updateProduct(originalRow._id, updatedRow);
                    toast({
                      title: "Éxito",
                      description: "Producto actualizado correctamente",
                    });
                    await fetchProducts();
                  } catch (error) {
                    console.error('Error updating product:', error);
                    toast({
                      title: "Error",
                      description: "No se pudo actualizar el producto",
                      variant: "destructive",
                    });
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
                  amountPerHour: "0",
                  amount: "0",
                  netUnitValue: "0",
                  totalValue: "0",
                  return: "0",
                  machineryRelationship: "",
                  packagingCode: "",
                  invoiceNumber: "",
                  workId: selectedFaena ? String(selectedFaena.id || (selectedFaena as any)._id) : "",
                }}
                addableColumns={[
                  "category", "product", "unitOfMeasurement", "amountPerHour", 
                  "amount", "netUnitValue", "totalValue", "return", "machineryRelationship", "packagingCode", "invoiceNumber"
                ]}
                onInlineAdd={async (newProduct) => {
                  try {
                    if (!selectedFaena) {
                      toast({
                        title: "Error",
                        description: "No hay una orden seleccionada",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Validate required fields
                    const requiredFields = {
                      'category': newProduct.category,
                      'product': newProduct.product,
                      'unitOfMeasurement': newProduct.unitOfMeasurement,
                      'amount': newProduct.amount,
                      'netUnitValue': newProduct.netUnitValue,
                      'totalValue': newProduct.totalValue
                    };
                    
                    const missingFields = Object.entries(requiredFields)
                      .filter(([key, value]) => !value || value === "")
                      .map(([key]) => key);
                    
                    if (missingFields.length > 0) {
                      toast({
                        title: "Error de validación",
                        description: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`,
                        variant: "destructive",
                      });
                      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                    }

                    const workId = selectedFaena.id || (selectedFaena as any)._id;
                    const productData = {
                      ...newProduct,
                      workId: String(workId),
                      machineryRelationship: "", // Default empty relationship
                    };
                    
                    console.log('Adding new product:', productData);
                    await productService.createProduct(productData);
                    
                    toast({
                      title: "Éxito",
                      description: "Producto agregado correctamente",
                    });
                    
                    await fetchProducts();
                  } catch (error) {
                    console.error('Error adding product:', error);
                    toast({
                      title: "Error",
                      description: "No se pudo agregar el producto",
                      variant: "destructive",
                    });
                    throw error; // Re-throw to prevent the row from being removed
                  }
                }}
              />
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FaenasAgricolas; 