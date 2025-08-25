import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { FormGrid } from "@/components/Grid/FormGrid";
import { Trash2 } from "lucide-react";
import type { IWork, WorkType as LibWorkType, IWorkers, IMachinery, IProducts } from "@eon-lib/eon-mongoose";
import type { FormGridRules } from "@/lib/validationSchemas";
import type { WorkMasterData, WorkType } from "../types/workTypes";
import type { Column } from "@/lib/store/gridStore";
import workerService from "@/_services/workerService";
import machineryService from "@/_services/machineryService";
import productService from "@/_services/productService";
import inventoryProductService from "@/_services/inventoryProductService";
import inventoryMovementService from "@/_services/inventoryMovementService";
import inventoryWarehouseService from "@/_services/inventoryWarehouseService";
import workService from "@/_services/workService";
import { toast } from "@/components/ui/use-toast";
import ProductSelectionModal from "@/components/ProductSelectionModal";
import { useAuthStore } from "@/lib/store/authStore";

interface BaseWorkFormProps {
  workType: WorkType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IWork>) => Promise<void>;
  
  // Configuración del formulario
  formSections: SectionConfig[];
  fieldRules?: FormGridRules;
  validationSchema?: any;
  defaultValues?: Record<string, any>;
  
  // Datos para el formulario
  masterData: WorkMasterData;
  selectedWork?: IWork | null;
  isEditMode?: boolean;
  
  // Customización
  title?: string;
  description?: string;
  submitLabel?: string;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  
  // Estados
  isSubmitting?: boolean;
}

/**
 * Componente base para formularios de trabajo
 * Reutilizable para todos los tipos de trabajo
 */
export const BaseWorkForm: React.FC<BaseWorkFormProps> = ({
  workType,
  isOpen,
  onClose,
  onSubmit,
  formSections,
  fieldRules,
  validationSchema,
  defaultValues = {},
  masterData,
  selectedWork,
  isEditMode = false,
  title,
  description,
  submitLabel,
  customHeader,
  customFooter,
  isSubmitting = false,
}) => {
  const { propertyId } = useAuthStore();
  const [submitFormFunction, setSubmitFormFunction] = useState<(() => void) | null>(null);
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false);

  // Estados para manejar datos de entidades relacionadas
  const [workers, setWorkers] = useState<IWorkers[]>([]);
  const [machinery, setMachinery] = useState<IMachinery[]>([]);
  const [products, setProducts] = useState<IProducts[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  // Estados para modal de selección de productos
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProductField, setCurrentProductField] = useState<any>(null);
  const [currentFormType, setCurrentFormType] = useState<'add' | 'edit' | null>(null);
  const [availableInventoryProducts, setAvailableInventoryProducts] = useState<any[]>([]);
  const [propertyWarehouses, setPropertyWarehouses] = useState<any[]>([]);

  // Calcular valores por defecto del formulario
  const formDefaultValues = React.useMemo(() => {
    const baseDefaults = {
      workType,
      ...defaultValues,
    };

    // Si estamos editando, usar datos del trabajo seleccionado
    if (isEditMode && selectedWork) {
      const editData = {
        ...baseDefaults,
        ...selectedWork,
        // Asegurar que las fechas estén en formato correcto para inputs
        executionDate: selectedWork.executionDate 
          ? new Date(selectedWork.executionDate).toISOString().split('T')[0]
          : '',
        startDate: selectedWork.startDate 
          ? new Date(selectedWork.startDate).toISOString().split('T')[0]
          : '',
        endDate: selectedWork.endDate 
          ? new Date(selectedWork.endDate).toISOString().split('T')[0]
          : '',
        gracePeriodEndDate: selectedWork.gracePeriodEndDate 
          ? new Date(selectedWork.gracePeriodEndDate).toISOString().split('T')[0]
          : '',
        reEntryDate: selectedWork.reEntryDate 
          ? new Date(selectedWork.reEntryDate).toISOString().split('T')[0]
          : '',
      };

      // Si task es un objeto, convertirlo al ID para el formulario (como en OrdenAplicacion.tsx)
      if (selectedWork.task && typeof selectedWork.task === 'object') {
        (editData as any).task = (selectedWork.task as any).id || (selectedWork.task as any)._id || "";
      } else {
        (editData as any).task = selectedWork.task || "";
      }

      return editData;
    }

    return baseDefaults;
  }, [workType, defaultValues, isEditMode, selectedWork]);

  // Procesar secciones del formulario con datos dinámicos
  const processedFormSections = React.useMemo(() => {
    return formSections.map(section => ({
      ...section,
      fields: section.fields.map(field => {
        let processedField = { ...field };

        // Agregar opciones dinámicas según el tipo de campo
        switch (field.name) {
          case 'barracks':
            processedField.options = masterData.cuarteles.map(cuartel => ({
              value: cuartel._id,
              label: cuartel.areaName || cuartel._id
            }));
            break;

          case 'taskType':
            processedField.options = masterData.taskTypes.map(taskType => ({
              value: taskType._id,
              label: taskType.name || taskType._id
            }));
            break;

          case 'task':
            // Las opciones de task se manejan dinámicamente por field rules
            processedField.options = masterData.allTasks.map(task => ({
              value: task._id,
              label: task.taskName || task._id
            }));
            break;

          case 'climateConditions':
            processedField.options = masterData.weatherConditions.map(condition => ({
              value: condition._id,
              label: condition.description || condition._id
            }));
            break;

          case 'windSpeed':
            processedField.options = masterData.windConditions.map(condition => ({
              value: condition._id,
              label: condition.windConditionName || condition._id
            }));
            break;

          // Responsables
          case 'responsibles.supervisor.userId':
          case 'responsibles.planner.userId':
          case 'responsibles.technicalVerifier.userId':
          case 'responsibles.applicators.0.userId':
            processedField.options = masterData.workerList.map(worker => ({
              value: worker._id,
              label: `${worker.names} ${worker.lastName}` || worker._id
            }));
            break;

          default:
            // Mantener campo sin cambios
            break;
        }

        return processedField;
      })
    }));
  }, [formSections, masterData]);

  // Configuraciones de columnas para las grids de entidades
  const workersColumns: Column[] = useMemo(() => [
    {
      id: "worker",
      header: "Trabajador",
      accessor: "worker",
      visible: true,
      sortable: true,
      render: (value: string) => {
        const worker = masterData.workerList.find(w => w._id === value || (w as any).id === value);
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
  ], [masterData.workerList]);

  const machineryColumns: Column[] = useMemo(() => [
    {
      id: "machinery",
      header: "Maquinaria",
      accessor: "machinery",
      visible: true,
      sortable: true,
      render: (value: string) => {
        const machine = masterData.machineryList.find(m => m._id === value || (m as any).id === value);
        return machine ? (machine as any).equipment || (machine as any).name || value : value;
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
  ], [masterData.machineryList]);

  const productsColumns: Column[] = useMemo(() => [
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
    {
      id: "treatment",
      header: "Tratamiento",
      accessor: "treatment",
      visible: true,
      sortable: true,
    },
    {
      id: "doses",
      header: "Dosis",
      accessor: "doses",
      visible: true,
      sortable: true,
    },
    {
      id: "calibration",
      header: "Calibración",
      accessor: "calibration",
      visible: true,
      sortable: true,
    },
  ], [masterData.warehouseProducts]);

  // Field configurations for FormGrid components
  const workersFieldConfigurations = useMemo(() => ({
    worker: {
      type: 'select' as const,
      placeholder: 'Seleccionar trabajador',
      style: { minWidth: '150px' },
      options: masterData.workerList
        .filter(worker => worker._id) // Solo incluir workers con _id válido
        .map((worker) => ({
          value: worker._id,
          label: `${worker.names} ${worker.lastName} (${worker.rut})`
        }))
    },
    classification: {
      type: 'text' as const,
      placeholder: 'Clasificación del trabajador',
      style: { minWidth: '120px' }
    },
    quadrille: {
      type: 'text' as const,
      placeholder: 'Cuadrilla',
      style: { minWidth: '80px' }
    },
    workingDay: {
      type: 'number' as const,
      placeholder: '1.0',
      min: 0,
      max: 99,
      step: 0.1,
      style: { minWidth: '70px' }
    },
    paymentMethod: {
      type: 'select' as const,
      placeholder: 'Método de pago',
      style: { minWidth: '130px' },
      options: [
        { value: 'trato', label: 'Trato' },
        { value: 'trato-dia', label: 'Trato + Día' },
        { value: 'dia-laboral', label: 'Día laboral' },
        { value: 'mayor-trato-dia', label: 'Mayor entre trato o día laboral' },
        { value: 'trato-dia-laboral', label: 'Trato - dia laboral' },
        { value: 'ajuste-septimodia', label: 'Ajuste al 7mo día' }
      ]
    },
    contractor: {
      type: 'text' as const,
      placeholder: 'Contratista',
      style: { minWidth: '100px' }
    },
    date: {
      type: 'date' as const,
      style: { minWidth: '120px' }
    },
    salary: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    yield: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    totalHoursYield: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    yieldValue: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    overtime: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    bonus: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    additionalBonuses: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    dayValue: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    totalDeal: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    dailyTotal: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    value: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    exportPerformance: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    juicePerformance: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    othersPerformance: {
      type: 'number' as const,
      min: 0,
      placeholder: '0',
      style: { minWidth: '80px' }
    },
    state: {
      type: 'checkbox' as const,
      style: { minWidth: '50px' }
    }
  }), [masterData.workerList]);

  const machineryFieldConfigurations = useMemo(() => ({
    machinery: {
      type: 'select' as const,
      placeholder: 'Seleccionar maquinaria',
      options: masterData.machineryList.map(m => ({
        value: m._id,
        label: (m as any).equipment || (m as any).name || m._id
      }))
    },
    startTime: {
      type: 'time' as const,
      placeholder: 'HH:MM'
    },
    endTime: {
      type: 'time' as const,
      placeholder: 'HH:MM'
    },
    finalHours: {
      type: 'number' as const,
      placeholder: 'Horas finales'
    },
    timeValue: {
      type: 'number' as const,
      placeholder: 'Valor por hora'
    },
    totalValue: {
      type: 'number' as const,
      placeholder: 'Valor total'
    }
  }), [masterData.machineryList]);

  const productsFieldConfigurations = useMemo(() => ({
    category: {
      type: 'text' as const,
      placeholder: "Categoría",
      readonly: true,
      style: { 
        backgroundColor: '#f5f5f5', 
        color: '#666',
        cursor: 'not-allowed' 
      }

    },
    product: {
      type: 'custom' as const,
      placeholder: "Seleccionar producto",
      customRender: (field: any, config: any, handleChange: (value: any) => void) => (
        <div className="relative">
          <input
            type="text"
            value={field.value || ""}
            placeholder={config.placeholder}
            readOnly
            onClick={() => {
              // Determinar si estamos en modo add o edit basado en el contexto
              // Para esto necesitaríamos una forma de detectar el contexto actual
              const formType = 'add'; // Por defecto, pero podríamos mejorarlo
              handleProductModalOpen(field, formType);
            }}
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
      type: 'text' as const,
      placeholder: "Unidad de medida",
      readonly: false,
      style: { 
        backgroundColor: '#f5f5f5', 
        color: '#666',
        cursor: 'not-allowed' 
      }
    },
    amountPerHour: {
      type: 'number' as const,
      min: 0,
      placeholder: "0"
    },
    amount: {
      type: 'number' as const,
      min: 0,
      placeholder: "0"
    },
    netUnitValue: {
      type: 'number' as const,
      min: 0,
      placeholder: "0"
    },
    totalValue: {
      type: 'number' as const,
      min: 0,
      placeholder: "0"
    },
    return: {
      type: 'number' as const,
      min: 0,
      placeholder: "0"
    },
    machineryRelationship: {
      type: 'select' as const,
      placeholder: "Seleccionar maquinaria",
      style: { minWidth: '200px' },
      options: masterData.machineryList
        .filter(machine => machine._id) // Solo incluir machinery con _id válido
        .map((machine) => ({
          value: machine._id,
          label: `${machine.equipment} - ${machine.machineryCode} (${machine.brand})`
        }))
    },
    packagingCode: {
      type: 'text' as const,
      placeholder: "Código de envase"
    },
    invoiceNumber: {
      type: 'text' as const,
      placeholder: "Número de factura"
    },
    treatment: {
      type: 'text' as const,
      placeholder: "Tratamiento"
    },
    doses: {
      type: 'text' as const,
      placeholder: "Dosis"
    },
    calibration: {
      type: 'text' as const,
      placeholder: "Calibración"
    }
  }), [masterData.warehouseProducts]);

  // =======================================
  // REGLAS DE CAMPO PARA FORMGRIDS
  // =======================================

  // Constante para horas por jornada
  const HOURS_PER_WORKDAY = 8; // 1 jornada = 8 horas

  // Reglas para grid de trabajadores - IMPLEMENTACIÓN COMPLETA
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
          preset: (formData, _parentData, externalData) => {
            const worker = externalData?.workerList?.find((w: any) => w._id === formData.worker);
            return worker?.defaultClassification || 'General';
          }
        }
      },
      
      // 3. Preseleccionar tipo de pago
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'paymentMethod',
          source: 'parent',
          sourceField: 'paymentMethodToWorkers'
        }
      },
      
      // 4. Preseleccionar fecha actual
      {
        trigger: { field: 'worker' },
        action: {
          type: 'preset',
          targetField: 'date',
          preset: () => new Date().toISOString().split('T')[0]
        }
      },
      
      // 5. Calcular total horas rendimiento inicial (1 jornada = 8 horas por defecto)
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
      
      // 6. Calcular "total horas rendimiento" = jornada * horas por jornada
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
      
      // 7. Calcular "valor día" = sueldo / 30 (si sueldo > 0)
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
      
      // 8. Calcular "total trato" = rendimiento * valor rendimiento
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
      
      // 9. Calcular "total diario" = valor día x jornada (para día laboral)
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
      
      // 10. Función auxiliar para calcular value según método de pago
      ...['paymentMethod', 'totalDeal', 'bonus', 'dailyTotal'].map(field => ({
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
      
      // 11. Cadena de recálculos cuando cambia el salario
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
    parentData: selectedWork,
    externalData: {
      workerList: masterData.workerList,
      taskPrice: selectedWork?.taskPrice || (selectedWork?.task as any)?.taskPrice || 0
    }
  }), [selectedWork, masterData.workerList]);

  // Reglas para grid de maquinaria
  const machineryGridRules: FormGridRules = useMemo(() => ({
    rules: [
      // 1. Preseleccionar "valor tiempo" desde "precio por hora" de la maquinaria seleccionada
      {
        trigger: { field: 'machinery' },
        action: {
          type: 'preset',
          targetField: 'timeValue',
          preset: (formData, _parentData, externalData) => {
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
    parentData: selectedWork,
    externalData: {
      machineryList: masterData.machineryList
    }
  }), [selectedWork, masterData.machineryList]);

  // =======================================
  // FUNCIONES PARA ACTUALIZAR ARRAYS DE WORK
  // =======================================

  /**
   * Convertir datos de FormGrid Worker al formato WorkWorkers de IWork
   */
  const convertToWorkWorker = (workerData: any, workId?: string): any => {
    // Buscar información completa del trabajador por su ID
    const selectedWorker = masterData.workerList.find(
      worker => worker._id === workerData.worker || (worker as any).id === workerData.worker
    );


    return {
      id: workerData.id,
      workId: workId || (selectedWork?._id || selectedWork?.id) || "",
      classification: workerData.classification || "",
      worker: {
        id: workerData.worker || "",
        workerNationality: selectedWorker?.workerNationality || "",
        rutDniNationality: selectedWorker?.rutDniNationality || "",
        identificationDocumentType: selectedWorker?.identificationDocumentType || "",
        rut: selectedWorker?.rut || "",
        internalCod: selectedWorker?.internalCod || "",
        names: selectedWorker?.names || "",
        lastName: selectedWorker?.lastName || "",
        secondLastName: selectedWorker?.secondLastName || "",
      },
      quadrille: workerData.quadrille || "",
      workingDay: Number(workerData.workingDay || 1),
      paymentMethod: workerData.paymentMethod || "trato", // Default to valid enum value
      yield: Number(workerData.yield || 0),
      totalHoursYield: Number(workerData.totalHoursYield || 8),
      overtime: Number(workerData.overtime || 0),
      bonus: Number(workerData.bonus || 0),
      yieldValue: Number(workerData.yieldValue || 0),
      dayValue: Number(workerData.dayValue || 0),
      additionalBonuses: Number(workerData.additionalBonuses || 0),
      exportPerformance: Number(workerData.exportPerformance || 0),
      juicePerformance: Number(workerData.juicePerformance || 0),
      othersPerformance: Number(workerData.othersPerformance || 0),
      totalDeal: Number(workerData.totalDeal || 0),
      dailyTotal: Number(workerData.dailyTotal || 0),
      value: Number(workerData.value || 0),
      salary: Number(workerData.salary || 0),
      date: workerData.date || new Date().toISOString().split('T')[0],
      contractor: workerData.contractor || "",
      state: Boolean(workerData.state !== false), // Default to true unless explicitly false
    };
  };

  /**
   * Convertir datos de FormGrid Machinery al formato WorkMachinery de IWork
   */
  const convertToWorkMachinery = (machineryData: any, workId?: string): any => {
    // Usar el entityId proporcionado o generar ID ficticio

    return {
      id: machineryData.id,
      workId: workId || (selectedWork?._id || selectedWork?.id) || "",
      machinery: machineryData.machinery || "",
      startTime: machineryData.startTime || "",
      endTime: machineryData.endTime || "",
      finalHours: Number(machineryData.finalHours || 0),
      timeValue: Number(machineryData.timeValue || 0),
      totalValue: Number(machineryData.totalValue || 0),
    };
  };

  /**
   * Convertir datos de FormGrid Product al formato WorkProducts de IWork
   */
  const convertToWorkProduct = (productData: any, workId?: string, entityId?: string): any => {
    // Usar el entityId proporcionado o generar ID ficticio
    const recordId = entityId || productData.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return {
      id: recordId,
      entityId: entityId, // ID de la entidad separada para futuras búsquedas
      workId: workId || (selectedWork?._id || selectedWork?.id) || "",
      category: productData.category || "",
      product: productData.product || "",
      unitOfMeasurement: productData.unitOfMeasurement || "",
      amountPerHour: String(productData.amountPerHour || 0),
      amount: String(productData.amount || 0),
      netUnitValue: String(productData.netUnitValue || 0),
      totalValue: String(productData.totalValue || 0),
      return: String(productData.return || 0),
      machineryRelationship: productData.machineryRelationship || "",
      packagingCode: productData.packagingCode || "",
      invoiceNumber: productData.invoiceNumber || "",
      treatment: productData.treatment || "",
      doses: productData.doses || "",
      calibration: productData.calibration || "",
    };
  };

  /**
   * Actualizar el array de workers en el registro Work
   */
  const updateWorkWorkers = async (action: 'add' | 'update' | 'remove', workerData?: any, originalWorkerId?: string) => {
    if (!selectedWork) return;

    try {
      const currentWork = await workService.findById(selectedWork._id || selectedWork.id);
      const currentWorkers = currentWork.workers || [];

      let updatedWorkers: any[];

      switch (action) {
        case 'add':
          const workId = selectedWork._id || selectedWork.id;
          const workWorker = convertToWorkWorker(workerData, workId);
          updatedWorkers = [...currentWorkers, workWorker];
          break;
        case 'update':
          const updateWorkId = selectedWork._id || selectedWork.id;
          updatedWorkers = currentWorkers.map((worker: any) =>
            worker.id === workerData.id // Buscar por entityId para hacer la actualización correcta
              ? convertToWorkWorker(workerData, updateWorkId)
              : worker
          );
          break;
        case 'remove':
          updatedWorkers = currentWorkers.filter((worker: any) =>
            worker.id !== workerData.id // Filtrar por id
          );
          break;
        default:
          updatedWorkers = currentWorkers;
      }

      // Actualizar solo los workers usando el endpoint específico
      await workService.updateWorkers(selectedWork._id || selectedWork.id, updatedWorkers);

      console.log(`Work workers array updated (${action}):`, updatedWorkers);

    } catch (error) {
      console.error(`Error updating work workers array (${action}):`, error);
      // No lanzar error para no bloquear la operación principal
    }
  };

  /**
   * Actualizar el array de machinery en el registro Work
   */
  const updateWorkMachinery = async (action: 'add' | 'update' | 'remove', machineryData?: any) => {
    if (!selectedWork) return;

    try {
      const currentWork = await workService.findById(selectedWork._id || selectedWork.id);
      const currentMachinery = currentWork.machinery || [];

      let updatedMachinery: any[];

      switch (action) {
        case 'add':
          const workId = selectedWork._id || selectedWork.id;
          const workMachinery = convertToWorkMachinery(machineryData, workId);
          updatedMachinery = [...currentMachinery, workMachinery];
          break;
        case 'update':
          const updateWorkId = selectedWork._id || selectedWork.id;
          updatedMachinery = currentMachinery.map((machinery: any) =>
            machinery.id === machineryData.id
              ? convertToWorkMachinery(machineryData, updateWorkId)
              : machinery
          );
          break;
        case 'remove':
          updatedMachinery = currentMachinery.filter((machinery: any) =>
            machinery.id !== machineryData.id
          );
          break;
        default:
          updatedMachinery = currentMachinery;
      }

      // Actualizar solo la maquinaria usando el endpoint específico
      await workService.updateMachinery(selectedWork._id || selectedWork.id, updatedMachinery);

      console.log(`Work machinery array updated (${action}):`, updatedMachinery);

    } catch (error) {
      console.error(`Error updating work machinery array (${action}):`, error);
      // No lanzar error para no bloquear la operación principal
    }
  };

  /**
   * Actualizar el array de products en el registro Work
   */
  const updateWorkProducts = async (action: 'add' | 'update' | 'remove', productData?: any, originalProductId?: string, entityId?: string) => {
    if (!selectedWork) return;

    try {
      const currentWork = await workService.findById(selectedWork._id || selectedWork.id);
      const currentProducts = currentWork.products || [];

      let updatedProducts: any[];

      switch (action) {
        case 'add':
          const workId = selectedWork._id || selectedWork.id;
          const workProduct = convertToWorkProduct(productData, workId, entityId);
          updatedProducts = [...currentProducts, workProduct];
          break;
        case 'update':
          const updateWorkId = selectedWork._id || selectedWork.id;
          updatedProducts = currentProducts.map((product: any) =>
            product.entityId === entityId
              ? convertToWorkProduct(productData, updateWorkId, entityId)
              : product
          );
          break;
        case 'remove':
          updatedProducts = currentProducts.filter((product: any) =>
            product.entityId !== entityId
          );
          break;
        default:
          updatedProducts = currentProducts;
      }

      // Actualizar solo los productos usando el endpoint específico
      await workService.updateProducts(selectedWork._id || selectedWork.id, updatedProducts);

      console.log(`Work products array updated (${action}):`, updatedProducts);

    } catch (error) {
      console.error(`Error updating work products array (${action}):`, error);
      // No lanzar error para no bloquear la operación principal
    }
  };

  // =======================================
  // FUNCIONES DE FETCH DE DATOS
  // =======================================

  /**
   * Función para obtener trabajadores desde work.workers del trabajo actual
   */
  const fetchWorkers = async () => {
    if (!selectedWork) {
      console.log('No selected work, skipping fetchWorkers');
      return;
    }
    
    try {
      setIsLoadingEntities(true);
      console.log('Getting workers from work.workers for work:', selectedWork._id || selectedWork.id);
      
      // Obtener los trabajadores directamente del array work.workers
      const workWorkers = selectedWork.workers || [];
      console.log('Workers from work.workers:', workWorkers);
      
      // Convertir la estructura de work.workers al formato esperado por el grid
      const convertedWorkers = workWorkers.map((workWorker: any, index: number) => ({
        id: workWorker.id, // Usar el ID del schema o generar uno temporal
        worker: workWorker.worker?.id || workWorker.worker || '',
        classification: workWorker.classification || '',
        quadrille: workWorker.quadrille || '',
        workingDay: Number(workWorker.workingDay) || 1,
        paymentMethod: workWorker.paymentMethod || '',
        contractor: workWorker.contractor || '',
        date: workWorker.date || '',
        salary: Number(workWorker.salary) || 0,
        yield: Number(workWorker.yield) || 0,
        totalHoursYield: Number(workWorker.totalHoursYield) || 0,
        yieldValue: Number(workWorker.yieldValue) || 0,
        overtime: Number(workWorker.overtime) || 0,
        bonus: Number(workWorker.bonus) || 0,
        additionalBonuses: Number(workWorker.additionalBonuses) || 0,
        dayValue: Number(workWorker.dayValue) || 0,
        totalDeal: Number(workWorker.totalDeal) || 0,
        dailyTotal: Number(workWorker.dailyTotal) || 0,
        value: Number(workWorker.value) || 0,
        exportPerformance: Number(workWorker.exportPerformance) || 0,
        juicePerformance: Number(workWorker.juicePerformance) || 0,
        othersPerformance: Number(workWorker.othersPerformance) || 0,
        state: workWorker.state !== false, // Mantener el estado del schema
        workId: selectedWork._id || selectedWork.id
      }));
      
      console.log('Converted workers for grid:', convertedWorkers);
      setWorkers(convertedWorkers);
    } catch (error) {
      console.error("Error loading workers from work.workers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los trabajadores del trabajo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEntities(false);
    }
  };

  /**
   * Función para obtener maquinaria desde work.machinery del trabajo actual
   */
  const fetchMachinery = async () => {
    if (!selectedWork) {
      console.log('No selected work, skipping fetchMachinery');
      return;
    }
    
    try {
      setIsLoadingEntities(true);
      console.log('Getting machinery from work.machinery for work:', selectedWork._id || selectedWork.id);
      
      // Obtener la maquinaria directamente del array work.machinery
      const workMachinery = selectedWork.machinery || [];
      console.log('Machinery from work.machinery:', workMachinery);
      
      // Convertir la estructura de work.machinery al formato esperado por el grid
      const convertedMachinery = workMachinery.map((workMachine: any, index: number) => ({
        id: workMachine.id, // ID temporal para el grid
        machinery: workMachine.machinery || '',
        startTime: workMachine.startTime || '',
        endTime: workMachine.endTime || '',
        finalHours: parseFloat(workMachine.finalHours) || 0,
        timeValue: parseFloat(workMachine.timeValue) || 0,
        totalValue: parseFloat(workMachine.totalValue) || 0,
        workId: selectedWork._id || selectedWork.id
      }));
      
      console.log('Converted machinery for grid:', convertedMachinery);
      setMachinery(convertedMachinery);
    } catch (error) {
      console.error("Error loading machinery from work.machinery:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las maquinarias del trabajo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEntities(false);
    }
  };

  /**
   * Función para obtener productos desde work.products del trabajo actual
   */
  const fetchProducts = async () => {
    if (!selectedWork) {
      console.log('No selected work, skipping fetchProducts');
      return;
    }
    
    try {
      setIsLoadingEntities(true);
      console.log('Getting products from work.products for work:', selectedWork._id || selectedWork.id);
      
      // Obtener los productos directamente del array work.products
      const workProducts = selectedWork.products || [];
      console.log('Products from work.products:', workProducts);
      
      // Convertir la estructura de work.products al formato esperado por el grid
      const convertedProducts = workProducts.map((workProduct: any, index: number) => ({
        _id: `work-product-${index}-${Date.now()}`, // ID temporal para el grid
        category: workProduct.category || '',
        product: workProduct.product || '',
        unitOfMeasurement: workProduct.unitOfMeasurement || '',
        amountPerHour: parseFloat(workProduct.amountPerHour) || 0,
        amount: parseFloat(workProduct.amount) || 0,
        netUnitValue: parseFloat(workProduct.netUnitValue) || 0,
        totalValue: parseFloat(workProduct.totalValue) || 0,
        return: parseFloat(workProduct.return) || 0,
        machineryRelationship: workProduct.machineryRelationship?.id || workProduct.machineryRelationship || '',
        packagingCode: workProduct.packagingCode || '',
        invoiceNumber: workProduct.invoiceNumber || '',
        treatment: workProduct.treatment || '',
        doses: workProduct.doses || '',
        calibration: workProduct.calibration || '',
        workId: selectedWork._id || selectedWork.id
      }));
      
      console.log('Converted products for grid:', convertedProducts);
      setProducts(convertedProducts);
    } catch (error) {
      console.error("Error loading products from work.products:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del trabajo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEntities(false);
    }
  };

  // =======================================
  // FUNCIONES PARA CARGAR PRODUCTOS DE INVENTARIO
  // =======================================

  const fetchAvailableInventoryProducts = async () => {
    if (!propertyId) {
      console.log('No propertyId available, skipping inventory products fetch');
      return;
    }

    try {
      console.log(`Loading inventory products with stock for property ${propertyId}`);
      const productsWithStock = await inventoryProductService.getProductsWithStockByPropertyId(propertyId);
      setAvailableInventoryProducts(productsWithStock);
      console.log(`Loaded ${productsWithStock.length} inventory products with stock`);
    } catch (error) {
      console.error('Error fetching inventory products with stock:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos de inventario",
        variant: "destructive",
      });
    }
  };

  const fetchPropertyWarehouses = async () => {
    if (!propertyId) {
      console.log('No propertyId available, skipping warehouses fetch');
      return;
    }

    try {
      console.log(`Loading warehouses for property ${propertyId}`);
      const warehouses = await inventoryWarehouseService.getWarehousesByPropertyId(propertyId);
      setPropertyWarehouses(warehouses);
      console.log(`Loaded ${warehouses.length} warehouses for property`);
    } catch (error) {
      console.error('Error fetching property warehouses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las bodegas del predio",
        variant: "destructive",
      });
    }
  };

  // =======================================
  // FUNCIONES PARA CONSUMO DE PRODUCTOS
  // =======================================

  const consumeInventoryProduct = async (productData: any) => {
    if (!propertyId || propertyWarehouses.length === 0) {
      console.warn('Cannot consume product: no propertyId or warehouses available');
      return;
    }

    try {
      // Find the inventory product by name
      const inventoryProduct = availableInventoryProducts.find(
        product => product.name === productData.product
      );

      if (!inventoryProduct) {
        console.warn(`Inventory product not found: ${productData.product}`);
        return;
      }

      // Use the first available warehouse for this property (could be enhanced to let user choose)
      const targetWarehouse = propertyWarehouses[0];
      if (!targetWarehouse) {
        console.warn('No warehouse available for product consumption');
        return;
      }

      // Calculate consumption quantity
      const consumptionQuantity = parseFloat(productData.amount) || 0;
      
      if (consumptionQuantity <= 0) {
        console.warn('Invalid consumption quantity:', consumptionQuantity);
        return;
      }

      console.log(`Consuming ${consumptionQuantity} units of product ${inventoryProduct.name} from warehouse ${targetWarehouse.name}`);

      // Execute consumption
      await inventoryMovementService.consumeProduct({
        productId: inventoryProduct._id,
        quantity: consumptionQuantity,
        warehouseId: targetWarehouse._id,
        propertyId: propertyId,
        allowNegativeStock: true, // Allow negative stock as per business requirements
        comments: `Consumo por orden de trabajo ${workType} - ${selectedWork?.orderNumber || 'Nueva orden'}`
      });

      console.log(`Successfully consumed ${consumptionQuantity} units of ${inventoryProduct.name}`);

      // Refresh available products to reflect updated stock
      await fetchAvailableInventoryProducts();

    } catch (error) {
      console.error('Error consuming inventory product:', error);
      toast({
        title: "Error en consumo de inventario",
        description: `No se pudo descontar ${productData.product} del inventario: ${error.message}`,
        variant: "destructive",
      });
      // Don't throw error to avoid blocking the main save operation
    }
  };

  // =======================================
  // FUNCIONES PARA MODAL DE PRODUCTOS
  // =======================================

  const handleProductModalOpen = (field: any, formType: 'add' | 'edit') => {
    setCurrentProductField(field);
    setCurrentFormType(formType);
    setIsProductModalOpen(true);
  };

  const handleProductSelect = (product: any) => {
    if (currentProductField && currentFormType) {
      // Actualizar el campo del producto
      currentProductField.onChange(product.name);
      
      // Actualizar campos relacionados basados en el producto seleccionado
      if (currentFormType === 'add') {
        // Para new row, necesitamos acceso al addForm
        // Aquí podríamos implementar lógica para auto-llenar campos relacionados
        console.log('Product selected for new row:', product);
      } else if (currentFormType === 'edit') {
        // Para edit row, necesitamos acceso al editForm
        // Aquí podríamos implementar lógica para auto-llenar campos relacionados
        console.log('Product selected for edit row:', product);
      }
    }
    setIsProductModalOpen(false);
    setCurrentProductField(null);
    setCurrentFormType(null);
  };

  // =======================================
  // EFFECTS PARA CARGAR DATOS
  // =======================================

  // Cargar datos cuando se abre en modo edición
  useEffect(() => {
    if (isEditMode && selectedWork && isOpen) {
      console.log('Loading entities for edit mode:', selectedWork._id || selectedWork.id);
      fetchWorkers();
      fetchMachinery();
      fetchProducts();
    }
  }, [isEditMode, selectedWork, isOpen]);

  // Cargar productos de inventario y bodegas cuando se abre el modal
  useEffect(() => {
    if (isOpen && propertyId) {
      fetchAvailableInventoryProducts();
      fetchPropertyWarehouses();
    }
  }, [isOpen, propertyId]);

  // Limpiar datos cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setWorkers([]);
      setMachinery([]);
      setProducts([]);
      setAvailableInventoryProducts([]);
      setPropertyWarehouses([]);
    }
  }, [isOpen]);

  /**
   * Manejar envío del formulario
   */
  const handleFormSubmit = async (formData: any) => {
    setIsInternalSubmitting(true);
    
    try {
      console.log(`Submitting ${workType} work form:`, formData);
      
      // Procesar datos del formulario
      let processedData = { ...formData };
      
      // Asegurar que el workType sea correcto
      processedData.workType = workType;

      // Si task es un string (ID seleccionado), convertirlo al formato de objeto esperado
      if (typeof processedData.task === 'string') {
        const selectedTaskId = processedData.task;
        // Buscar el task usando el ID
        const selectedTask = masterData.allTasks.find(task => task._id === selectedTaskId || (task as any).id === selectedTaskId);
        console.log('selectedTask', selectedTask);
        if (selectedTask) {
          // Convertir ITask al formato esperado por IWork.task
          processedData.task = {
            id: selectedTask._id || (selectedTask as any).id,
            optionalCode: selectedTask.optionalCode || '',
            taskName: selectedTask.taskName || '',
            taskPrice: selectedTask.taskPrice || 0,
            optimalYield: selectedTask.optimalYield || 0,
            isEditableInApp: selectedTask.isEditableInApp || false,
            usesWetCalculationPerHa: selectedTask.usesWetCalculationPerHa || false,
            usageContext: selectedTask.usageContext || '0',
            maxHarvestYield: selectedTask.maxHarvestYield || 0,
            showTotalEarningsInApp: selectedTask.showTotalEarningsInApp || false,
            associatedProducts: selectedTask.associatedProducts || [],
            requiresRowCount: selectedTask.requiresRowCount || false,
            requiresHourLog: selectedTask.requiresHourLog || false
          };
        }
      }

      await onSubmit(processedData);
      
      // Cerrar modal en caso de éxito
      onClose();
      
    } catch (error) {
      console.error(`Error submitting ${workType} work form:`, error);
      // El error se maneja en el hook que llama a esta función
    } finally {
      setIsInternalSubmitting(false);
    }
  };

  /**
   * Obtener título del modal
   */
  const getModalTitle = () => {
    if (title) return title;
    
    const workTypeLabels = {
      A: 'Orden de Aplicación',
      C: 'Cosecha',
      T: 'Trabajo Agrícola'
    };
    
    const baseTitle = workTypeLabels[workType] || 'Trabajo';
    return isEditMode ? `Editar ${baseTitle}` : `Nueva ${baseTitle}`;
  };

  /**
   * Obtener descripción del modal
   */
  const getModalDescription = () => {
    if (description) return description;
    
    const baseDescription = isEditMode 
      ? 'Modifica los datos del trabajo seleccionado'
      : 'Completa los datos para crear un nuevo trabajo';
      
    return baseDescription;
  };

  /**
   * Obtener etiqueta del botón de envío
   */
  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    return isEditMode ? 'Actualizar' : 'Crear';
  };

  const finalIsSubmitting = isSubmitting || isInternalSubmitting;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        {customHeader || (
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            <DialogDescription>{getModalDescription()}</DialogDescription>
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto">
          <DynamicForm
            sections={processedFormSections}
            onSubmit={handleFormSubmit}
            defaultValues={formDefaultValues}
            validationSchema={validationSchema}
            fieldRules={fieldRules}
            hideSubmitButtons={true}
            onFormReady={(submitFn) => setSubmitFormFunction(() => submitFn)}
          />

          {/* Grids de entidades - Solo en modo edición */}
          {isEditMode && selectedWork && (
            <div className="mt-8 space-y-6">
              {/* Grid de Trabajadores */}
              <div>
                <FormGrid
                  key={`workers-grid-${selectedWork._id || selectedWork.id}`}
                  gridId="workers-grid"
                  title="Trabajadores Asignados"
                  columns={workersColumns}
                  data={workers.map((worker, index) => ({
                    ...worker,
                    _id: (worker as any)._id || (worker as any).id || `worker-${index}-${Date.now()}`
                  }))}
                  idField="_id"
                  enableInlineEdit={true}
                  enableInlineAdd={true}
                  editableColumns={[
                    "worker", "classification", "quadrille", "workingDay", 
                    "paymentMethod", "contractor", "date", "salary", "yield", 
                    "totalHoursYield", "yieldValue", "overtime", "bonus", 
                    "additionalBonuses", "dayValue", "totalDeal", "dailyTotal", 
                    "value", "exportPerformance", "juicePerformance", "othersPerformance", "state"
                  ]}
                  addableColumns={[
                    "worker", "classification", "quadrille", "workingDay", 
                    "paymentMethod", "contractor", "date", "salary", "yield", 
                    "totalHoursYield", "yieldValue", "overtime", "bonus", 
                    "additionalBonuses", "dayValue", "totalDeal", "dailyTotal", 
                    "value", "exportPerformance", "juicePerformance", "othersPerformance", "state"
                  ]}
                  fieldConfigurations={workersFieldConfigurations}
                  fieldRules={workerGridRules}
                  defaultNewRow={{
                    classification: "",
                    worker: "",
                    quadrille: "",
                    workingDay: 1,
                    paymentMethod: "",
                    contractor: "",
                    date: new Date().toISOString().split('T')[0],
                    salary: 0,
                    yield: 0,
                    totalHoursYield: 8,
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
                    workId: selectedWork ? String(selectedWork._id || selectedWork.id) : "",
                    state: true
                  }}
                  actions={(row: any) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          console.log('Soft deleting worker:', (row as any).id);
                          
                          
                          // Primero cambiar estado a false en la entidad Workers si tiene entityId
                          if (row.id) {
                            await workerService.softDeleteWorker(row.id);
                            console.log('Worker state set to false in entity successfully');
                          }
                          
                          // Luego eliminar del array workers en Work
                          await updateWorkWorkers('remove', row, undefined);
                          
                          toast({
                            title: "Éxito",
                            description: "Trabajador eliminado correctamente",
                          });
                          
                          console.log('Refreshing workers list after deletion...');
                          await fetchWorkers();
                        } catch (error) {
                          console.error('Error removing worker from work:', error);
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
                  onEditSave={async (originalRow, updatedRow) => {
                    try {
                      console.log('Saving worker edit:', { originalRow, updatedRow });
                      
                      // Preparar datos para la entidad Workers
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
                      
                      
                      // Primero actualizar la entidad Workers si tiene entityId
                      if (workerData.id) {
                        await workerService.updateWorker(workerData.id, workerData);
                      }
                      
                      // Luego actualizar el array workers en Work
                      await updateWorkWorkers('update', updatedRow, undefined);
                      
                      await fetchWorkers();
                    } catch (error) {
                      console.error('Error updating worker:', error);
                      throw error; // Dejar que FormGrid maneje la notificación de error
                    }
                  }}
                  onInlineAdd={async (newWorker: any) => {
                    try {
                      if (!selectedWork) {
                        throw new Error("No hay un trabajo seleccionado");
                      }

                      const workId = selectedWork._id || selectedWork.id;
                      
                      // Preparar datos para la entidad Workers
                      const workerData = {
                        ...newWorker,
                        workId: String(workId),
                        state: true,
                        salary: Number(newWorker.salary || 0),
                        yield: Number(newWorker.yield || 0),
                        totalHoursYield: Number(newWorker.totalHoursYield || 8),
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
                      
                      // Primero crear la entidad Worker
                      const createdWorker = await workerService.createWorker(workerData as any);
                      console.log('Worker created in entity:', createdWorker);
                      
                      // Luego actualizar el array workers en Work usando el ID del registro creado
                      await updateWorkWorkers('add', {...newWorker, id: createdWorker._id }, undefined );
                      
                      await fetchWorkers();
                    } catch (error) {
                      console.error('Error adding worker:', error);
                      throw error; // Dejar que FormGrid maneje la notificación de error
                    }
                  }}
                />
              </div>

              {/* Grid de Maquinaria */}
              <div>
                <FormGrid
                  key={`machinery-grid-${selectedWork._id || selectedWork.id}`}
                  gridId="machinery-grid"
                  title="Maquinaria Utilizada"
                  columns={machineryColumns}
                  data={machinery.map((machine, index) => ({
                    ...machine,
                    _id: (machine as any)._id || (machine as any).id || `machinery-${index}-${Date.now()}`
                  }))}
                  idField="_id"
                  enableInlineEdit={true}
                  enableInlineAdd={true}
                  editableColumns={["machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"]}
                  addableColumns={["machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"]}
                  fieldConfigurations={machineryFieldConfigurations}
                  fieldRules={machineryGridRules}
                  defaultNewRow={{
                    machinery: "",
                    startTime: "",
                    endTime: "",
                    finalHours: "",
                    timeValue: 0,
                    totalValue: 0,
                    workId: selectedWork ? String(selectedWork._id || selectedWork.id) : "",
                  }}
                  actions={(row: any) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          console.log('Soft deleting machinery:', (row as any)._id);
                          
                          const entityId = (row as any)._id;
                          
                          // Primero cambiar estado a false en la entidad Machinery si tiene entityId
                          if (entityId) {
                            await machineryService.softDeleteMachinery(entityId);
                            console.log('Machinery state set to false in entity successfully');
                          }
                          
                          // Luego eliminar del array machinery en Work
                          await updateWorkMachinery('remove', undefined);
                          
                          toast({
                            title: "Éxito",
                            description: "Maquinaria eliminada correctamente",
                          });
                          
                          console.log('Refreshing machinery list after deletion...');
                          await fetchMachinery();
                        } catch (error) {
                          console.error('Error removing machinery from work:', error);
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
                  onEditSave={async (originalRow, updatedRow) => {
                    try {
                      console.log('Saving machinery edit:', { originalRow, updatedRow });
                      
                      // Preparar datos para la entidad Machinery
                      const machineryData = {
                        ...updatedRow
                      };
                      
                      const entityId = (originalRow as any)._id;
                      
                      // Primero actualizar la entidad Machinery si tiene entityId
                      if (entityId) {
                        await machineryService.updateMachinery(entityId, machineryData);
                      }
                      
                      // Luego actualizar el array machinery en Work
                      await updateWorkMachinery('update', updatedRow);
                      
                      await fetchMachinery();
                    } catch (error) {
                      console.error('Error updating machinery:', error);
                      throw error; // Dejar que FormGrid maneje la notificación de error
                    }
                  }}
                  onInlineAdd={async (newMachinery: any) => {
                    try {
                      if (!selectedWork) {
                        throw new Error("No hay un trabajo seleccionado");
                      }

                      const workId = selectedWork._id || selectedWork.id;
                      
                      // Preparar datos para la entidad Machinery
                      const machineryData = {
                        ...newMachinery,
                        workId: String(workId),
                      };
                      
                      console.log('Adding new machinery:', machineryData);
                      
                      // Primero crear la entidad Machinery
                      const createdMachinery = await machineryService.createMachinery(machineryData);
                      console.log('Machinery created in entity:', createdMachinery);
                      
                      // Luego actualizar el array machinery en Work usando el ID del registro creado
                      await updateWorkMachinery('add', {...newMachinery, id: createdMachinery._id});
                      
                      await fetchMachinery();
                    } catch (error) {
                      console.error('Error adding machinery:', error);
                      throw error; // Dejar que FormGrid maneje la notificación de error
                    }
                  }}
                />
              </div>

              {/* Grid de Productos */}
              <div>
                <FormGrid
                  key={`products-grid-${selectedWork._id || selectedWork.id}`}
                  gridId="products-grid"
                  title="Productos Utilizados"
                  columns={productsColumns}
                  data={products.map((product, index) => ({
                    ...product,
                    _id: (product as any)._id || (product as any).id || `product-${index}-${Date.now()}`
                  }))}
                  idField="_id"
                  enableInlineEdit={false}
                  enableInlineAdd={true}
                  fieldConfigurations={productsFieldConfigurations}
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
                    treatment: "",
                    doses: "",
                    calibration: "",
                    workId: selectedWork ? String(selectedWork.id || (selectedWork as any)._id) : "",
                  }}
                  addableColumns={[
                    "category", "product", "unitOfMeasurement", "amountPerHour", 
                    "amount", "netUnitValue", "totalValue", "return", "machineryRelationship", "packagingCode", "invoiceNumber", "treatment", "doses", "calibration"
                  ]}
                  actions={(row: any) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          console.log('Deleting product:', (row as any)._id);
                          
                          const entityId = (row as any)._id;
                          
                          // Primero eliminar de la entidad Products si tiene entityId (hard delete para products)
                          if (entityId) {
                            await productService.deleteProduct(entityId);
                            console.log('Product deleted from entity successfully');
                          }
                          
                          // Luego eliminar del array products en Work
                          await updateWorkProducts('remove', undefined, undefined, entityId);
                          
                          toast({
                            title: "Éxito",
                            description: "Producto eliminado correctamente",
                          });
                          
                          console.log('Refreshing products list after deletion...');
                          await fetchProducts();
                        } catch (error) {
                          console.error('Error removing product from work:', error);
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
                  onInlineAdd={async (newProduct: any) => {
                    try {
                      if (!selectedWork) {
                        throw new Error("No hay un trabajo seleccionado");
                      }

                      const workId = selectedWork._id || selectedWork.id;
                      
                      // Preparar datos para la entidad Products
                      const productData = {
                        ...newProduct,
                        workId: String(workId),
                        amount: String(newProduct.amount || 0),
                        netUnitValue: String(newProduct.netUnitValue || 0),
                        totalValue: String(newProduct.totalValue || 0),
                        amountPerHour: String(newProduct.amountPerHour || 0),
                        return: String(newProduct.return || 0),
                      };
                      
                      console.log('Adding new product:', productData);
                      
                      // Primero crear la entidad Product
                      const createdProduct = await productService.createProduct(productData);
                      console.log('Product created in entity:', createdProduct);
                      
                      // Luego actualizar el array products en Work usando el ID del registro creado
                      await updateWorkProducts('add', newProduct, undefined, createdProduct._id || createdProduct.id);
                      
                      // Consume product from inventory
                      await consumeInventoryProduct(newProduct);
                      
                      await fetchProducts();
                    } catch (error) {
                      console.error('Error adding product:', error);
                      throw error; // Dejar que FormGrid maneje la notificación de error
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {customFooter || (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={finalIsSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => submitFormFunction?.()}
              disabled={!submitFormFunction || finalIsSubmitting}
            >
              {finalIsSubmitting ? 'Procesando...' : getSubmitLabel()}
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
        setCurrentFormType(null);
      }}
      onSelect={handleProductSelect}
      products={availableInventoryProducts}
      title="Seleccionar Producto"
      description={`Busca y selecciona un producto del inventario del predio (${availableInventoryProducts.length} productos con lotes activos)`}
    />
  </>
  );
};

export default BaseWorkForm;