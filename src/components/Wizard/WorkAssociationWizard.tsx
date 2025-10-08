import React, { useMemo, useState } from "react";
import { Wizard } from "./index";
import { WizardStepConfig, WorkAssociationData } from "./types";
import { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { FormGrid } from "@/components/Grid/FormGrid";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { IWork, IWorkers, IMachinery, IProducts } from "@eon-lib/eon-mongoose/types";
import { 
  workerFormSchema, 
  machineryFormSchema, 
  productFormSchema,
  FormGridRules
} from "@/lib/validationSchemas";
import { createWorkAssociationRules } from "@/lib/fieldRules/workAssociationRules";

interface WorkAssociationWizardProps {
  entityType: string;
  entityData: Record<string, any>;
  onComplete: (data: WorkAssociationData) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  
  // Raw data arrays (like in WizardOrdenAplicacion)
  cuarteles?: any[];
  workerList?: any[];
  productOptions?: any[];
  machineryOptions?: any[];
  cropTypes?: any[];
  varietyTypes?: any[];
}

const WorkAssociationWizard: React.FC<WorkAssociationWizardProps> = ({
  entityType,
  entityData,
  onComplete,
  onCancel,
  defaultValues = {},
  // Raw data arrays
  cuarteles = [],
  workerList = [],
  productOptions = [],
  machineryOptions = [],
  cropTypes = [],
  varietyTypes = []
}) => {
  // Estados para controlar qué pasos mostrar
  const [needsHumanResources, setNeedsHumanResources] = React.useState(false);
  const [needsWarehouseProducts, setNeedsWarehouseProducts] = React.useState(false);
  const [needsMachinery, setNeedsMachinery] = React.useState(false);

  // Estados para manejar arrays locales (sin llamadas HTTP)
  const [localWorkers, setLocalWorkers] = useState<IWorkers[]>([]);
  const [localMachinery, setLocalMachinery] = useState<IMachinery[]>([]);
  const [localProducts, setLocalProducts] = useState<IProducts[]>([]);

  // Current date for default values
  const currentDate = new Date().toISOString().split('T')[0];

  // Crear reglas de reactividad - igual que WizardOrdenAplicacion
  const wizardRules = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Creating WorkAssociation fieldRules with data:', {
        cuarteles: cuarteles.length,
        cropTypes: cropTypes.length,
        varietyTypes: varietyTypes.length,
        sampleCuartel: cuarteles[0],
        sampleCropType: cropTypes[0],
        sampleVarietyType: varietyTypes[0]
      });
    }

    return createWorkAssociationRules({
      cuartelesOptions: cuarteles,
      cropTypesOptions: cropTypes,
      varietyTypesOptions: varietyTypes
    });
  }, [cuarteles, cropTypes, varietyTypes]);

  // Generate options for form fields - igual que WizardOrdenAplicacion
  const getFormOptions = useMemo(() => {
    const cuartelesFormOptions = cuarteles.map(cuartel => ({
      value: cuartel._id,
      label: cuartel.areaName
    }));
      
    const workerFormOptions = workerList.map(worker => ({
      value: worker._id || "",
      label: `${worker.names} ${worker.lastName} (${worker.rut})`
    }));

    const productFormOptions = productOptions.map(product => ({
      value: product._id || product.id,
      label: product.name
    }));

    const machineryFormOptions = machineryOptions.map(machinery => ({
      value: machinery._id || machinery.id,
      label: machinery.name
    }));
    
    return {
      cuarteles: cuartelesFormOptions,
      workers: workerFormOptions,
      products: productFormOptions,
      machinery: machineryFormOptions
    };
  }, [cuarteles, workerList, productOptions, machineryOptions]);

  // Configuraciones de columnas para FormGrid
  const workersColumns: Column[] = [
    { id: "worker", header: "Trabajador", accessor: "worker", visible: true, sortable: true },
    { id: "classification", header: "Clasificación", accessor: "classification", visible: true, sortable: true },
    { id: "quadrille", header: "Cuadrilla", accessor: "quadrille", visible: true, sortable: true },
    { id: "workingDay", header: "Jornadas", accessor: "workingDay", visible: true, sortable: true },
    { id: "paymentMethod", header: "Método de Pago", accessor: "paymentMethod", visible: true, sortable: true },
    { id: "contractor", header: "Contratista", accessor: "contractor", visible: true, sortable: true },
    { id: "date", header: "Fecha", accessor: "date", visible: true, sortable: true },
    { id: "salary", header: "Salario", accessor: "salary", visible: true, sortable: true }
  ];

  const machineryColumns: Column[] = [
    { id: "machinery", header: "Maquinaria", accessor: "machinery", visible: true, sortable: true },
    { id: "startTime", header: "Hora Inicio", accessor: "startTime", visible: true, sortable: true },
    { id: "endTime", header: "Hora Fin", accessor: "endTime", visible: true, sortable: true },
    { id: "finalHours", header: "Horas Finales", accessor: "finalHours", visible: true, sortable: true },
    { id: "timeValue", header: "Valor Tiempo", accessor: "timeValue", visible: true, sortable: true },
    { id: "totalValue", header: "Valor Total", accessor: "totalValue", visible: true, sortable: true }
  ];

  const productsColumns: Column[] = [
    { id: "category", header: "Categoría", accessor: "category", visible: true, sortable: true },
    { id: "product", header: "Producto", accessor: "product", visible: true, sortable: true },
    { id: "unitOfMeasurement", header: "Unidad Medida", accessor: "unitOfMeasurement", visible: true, sortable: true },
    { id: "amount", header: "Cantidad", accessor: "amount", visible: true, sortable: true },
    { id: "netUnitValue", header: "Valor Unitario", accessor: "netUnitValue", visible: true, sortable: true },
    { id: "totalValue", header: "Valor Total", accessor: "totalValue", visible: true, sortable: true }
  ];

  // Merge default values with current date preselection
  const finalDefaultValues = useMemo(() => {
    return {
      ...defaultValues,
      orderNumber: "ORD-" + Date.now(),
      executionDate: currentDate,
        workState: "confirmed",
      syncApp: false
    };
  }, [defaultValues, currentDate]);

  // Paso 1: Información básica del trabajo (SIN prefijo workData)
  const step1Sections: SectionConfig[] = [
    {
      id: "work-basic-info",
      title: "Información Básica del Trabajo",
      description: "Datos fundamentales del trabajo a asociar",
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
          placeholder: "Se autocompletará al seleccionar cuartel",
          required: false,
          disabled: true
        },
        {
          id: "variety",
          type: "text",
          label: "Variedad",
          name: "variety",
          placeholder: "Se autocompletará al seleccionar cuartel",
          required: false,
          disabled: true
        },
        {
          id: "workState",
          type: "select",
          label: "Estado del Trabajo",
          name: "workState",
          placeholder: "Estado del trabajo",
          required: true,
          options: [
            { value: "confirmed", label: "Confirmado" },
            { value: "pending", label: "Pendiente" },
            { value: "void", label: "Anulado" },
            { value: "blocked", label: "Bloqueado" }
          ]
        },
        {
          id: "syncApp",
          type: "checkbox",
          label: "Sincronizar con App",
          name: "syncApp",
          required: false
        }
      ]
    }
  ];

  // Paso 2: Recursos humanos (condicional)
  const step2Sections: SectionConfig[] = [
    {
      id: "human-resources-decision",
      title: "",
      description: "",
      fields: [
        {
          id: "needsHumanResources",
          type: "radio",
          label: "",
          name: "needsHumanResources",
          required: true,
          options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Sí" }
          ],
          onChange: (value: string) => {
            console.log('🔧 Changing needsHumanResources to:', value);
            setNeedsHumanResources(value === "yes");
          }
        }
      ]
    }
  ];

  // Paso 4: Productos de bodega (condicional)
  const step4Sections: SectionConfig[] = [
    {
      id: "warehouse-products-decision",
      title: "",
      description: "",
      fields: [
        {
          id: "needsWarehouseProducts",
          type: "radio",
          label: "",
          name: "needsWarehouseProducts",
          required: true,
          options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Sí" }
          ],
          onChange: (value: string) => {
            console.log('🔧 Changing needsWarehouseProducts to:', value);
            setNeedsWarehouseProducts(value === "yes");
          }
        }
      ]
    }
  ];

  // Paso 6: Maquinaria (condicional)
  const step6Sections: SectionConfig[] = [
    {
      id: "machinery-decision",
      title: "Equipos",
      description: "¿Requiere equipos o maquinaria?",
      fields: [
        {
          id: "needsMachinery",
          type: "radio",
          label: "¿Usar equipos?",
          name: "needsMachinery",
          required: true,
          options: [
            { value: "no", label: "No requiere equipos" },
            { value: "yes", label: "Sí, seleccionar equipos" }
          ],
          onChange: (value: string) => {
            console.log('🔧 Changing needsMachinery to:', value);
            setNeedsMachinery(value === "yes");
          }
        }
      ]
    }
  ];

  // Construir pasos usando el Wizard genérico extendido
  const buildWizardSteps = (): WizardStepConfig[] => {
    console.log('🏗️ Building wizard steps with states:', {
      needsHumanResources,
      needsWarehouseProducts,
      needsMachinery
    });

    const steps: WizardStepConfig[] = [
      {
        id: "work-info",
        title: "Información del Trabajo",
        description: "Datos básicos del trabajo",
        sections: step1Sections,
        customValidation: (formValues: any) => {
          // Validar campos requeridos del primer paso
          const hasOrderNumber = formValues.orderNumber && formValues.orderNumber.trim() !== '';
          const hasExecutionDate = formValues.executionDate && formValues.executionDate !== '';
          const hasBarracks = formValues.barracks && formValues.barracks !== '';
          const hasWorkState = formValues.workState && formValues.workState !== '';
          return hasOrderNumber && hasExecutionDate && hasBarracks && hasWorkState;
        }
      },
      {
        id: "human-resources-decision",
        title: "Personal",
        description: "¿Desea asignar personal a este trabajo?",
        sections: step2Sections,
        customValidation: (formValues: any) => {
          // Validar que se haya tomado una decisión
          return formValues.needsHumanResources === "yes" || formValues.needsHumanResources === "no";
        }
      }
    ];

    if (needsHumanResources) {
      console.log('✅ Adding human-resources-selection step because needsHumanResources =', needsHumanResources);
      steps.push({
        id: "human-resources-selection",
        title: "Asignar Personal",
        description: "Configure el personal asignado para este trabajo",
        sections: [], // Paso vacío para contenido personalizado
        customContent: (
          <div className="space-y-4">
            <div className="overflow-x-auto px-1">
              <FormGrid
                title=""
                gridId="wizard-workers-grid"
                columns={workersColumns}
                data={localWorkers.map((worker, index) => ({
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
                    onClick={() => {
                      setLocalWorkers(prev => prev.filter(w => w._id !== (row as any)._id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                fieldConfigurations={{
                  worker: {
                    type: "select",
                    options: getFormOptions.workers,
                    placeholder: "Seleccione un trabajador"
                  },
                  classification: {
                    type: "text",
                    placeholder: "Clasificación del trabajador"
                  },
                  quadrille: {
                    type: "text",
                    placeholder: "Cuadrilla asignada"
                  },
                  workingDay: {
                    type: "number",
                    placeholder: "Número de jornadas"
                  },
                  paymentMethod: {  
                    type: "select",
                    options: [
                      { value: "trato", label: "Trato" },
                      { value: "trato-dia", label: "Trato + Día" },
                      { value: "dia-laboral", label: "Día laboral" },
                      { value: "mayor-trato-dia", label: "Mayor entre trato o día laboral" },
                      { value: "trato-dia-laboral", label: "Trato - dia laboral" }
                    ],
                    placeholder: "Método de pago"
                  },
                  contractor: {
                    type: "text",
                    placeholder: "Contratista asignado"
                  },
                  date: {
                    type: "date"
                  },
                  salary: {
                    type: "number",
                    placeholder: "Salario del trabajador"
                  }
                }}
                enableInlineAdd={true}
                enableInlineEdit={true}
                editableColumns={["worker", "classification", "quadrille", "workingDay", "paymentMethod", "contractor", "date", "salary"]}
                addableColumns={["worker", "classification", "quadrille", "workingDay", "paymentMethod", "contractor", "date", "salary"]}
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
                  state: true
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  setLocalWorkers(prev => 
                    prev.map(w => w._id === originalRow._id ? { ...updatedRow } : w)
                  );
                }}
                onInlineAdd={async (newWorker) => {
                  const workerWithId = {
                    ...newWorker,
                    _id: `worker-${Date.now()}-${Math.random()}`
                  };
                  setLocalWorkers(prev => [...prev, workerWithId]);
                }}
                />
            </div>
          </div>
        ),
        isOptional: true // FormGrid steps are optional
      });
    }

    steps.push({
      id: "warehouse-products-decision",
      title: "Insumos de bodega",
      description: "¿Necesita insumos de bodega?",
      sections: step4Sections,
      customValidation: (formValues: any) => {
        return formValues.needsWarehouseProducts === "yes" || formValues.needsWarehouseProducts === "no";
      }
    });

    if (needsWarehouseProducts) {
      steps.push({
        id: "warehouse-products-selection",
        title: "Lista de Insumos",
        description: "Agregue los insumos que necesita para este trabajo",
        sections: [], // Paso vacío para contenido personalizado
        customContent: (
          <div className="space-y-4">
            <div className="overflow-x-auto px-1">
              <FormGrid
              title=""
                gridId="wizard-products-grid"
                columns={productsColumns}
                data={localProducts.map((product, index) => ({
                  ...product,
                  _id: product._id || `product-${index}-${Date.now()}`
                }))}
                idField="_id"
                editValidationSchema={productFormSchema}
                addValidationSchema={productFormSchema}
                actions={(row: IProducts) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setLocalProducts(prev => prev.filter(p => p._id !== (row as any)._id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                fieldConfigurations={{
                  category: {
                    type: "text",
                    placeholder: "Categoría del producto"
                  },
                  product: {
                    type: "select",
                    options: getFormOptions.products,
                    placeholder: "Seleccione un producto"
                  },
                  unitOfMeasurement: {
                    type: "text",
                    placeholder: "Ej: Litros, Kg, etc."
                  },
                  amountPerHour: {
                    type: "number",
                    placeholder: "Cantidad por hora"
                  },
                  amount: {
                    type: "number",
                    placeholder: "Cantidad total"
                  },
                  netUnitValue: {
                    type: "number",
                    placeholder: "Valor unitario neto"
                  },
                  totalValue: {
                    type: "number",
                    placeholder: "Valor total del producto"
                  },
                  return: {
                    type: "number",
                    placeholder: "Retorno del producto"
                  },
                  packagingCode: {
                    type: "text",
                    placeholder: "Código de embalaje"
                  },
                  invoiceNumber: {
                    type: "text",
                    placeholder: "Número de factura"
                  }
                }}
                enableInlineAdd={true}
                enableInlineEdit={true}
                editableColumns={["category", "product", "unitOfMeasurement", "amountPerHour", "amount", "netUnitValue", "totalValue", "return", "packagingCode", "invoiceNumber"]}
                addableColumns={["category", "product", "unitOfMeasurement", "amountPerHour", "amount", "netUnitValue", "totalValue", "return", "packagingCode", "invoiceNumber"]}
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
                  invoiceNumber: ""
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  setLocalProducts(prev => 
                    prev.map(p => p._id === originalRow._id ? { ...updatedRow } : p)
                  );
                }}
                onInlineAdd={async (newProduct) => {
                  const productWithId = {
                    ...newProduct,
                    _id: `product-${Date.now()}-${Math.random()}`
                  };
                  setLocalProducts(prev => [...prev, productWithId]);
                }}
                />
            </div>
          </div>
        ),
        isOptional: true
      });
    }

    steps.push({
      id: "machinery-decision",
      title: "Equipos",
      description: "Selección de maquinaría ",
      sections: step6Sections,
      customValidation: (formValues: any) => {
        return formValues.needsMachinery === "yes" || formValues.needsMachinery === "no";
      }
    });

    if (needsMachinery) {
      steps.push({
        id: "machinery-selection",
        title: "Maquinaria",
        description: "Agregue la maquinaria que necesita para este trabajo",
        sections: [], // Paso vacío para contenido personalizado
        customContent: (
          <div className="space-y-4">
            <div className="overflow-x-auto  px-1">
              <FormGrid
                title=""
                gridId="wizard-machinery-grid"
                columns={machineryColumns}
                data={localMachinery.map((machine, index) => ({
                  ...machine,
                  _id: machine._id || `machinery-${index}-${Date.now()}`
                }))}
                idField="_id"
                editValidationSchema={machineryFormSchema}
                addValidationSchema={machineryFormSchema}
                actions={(row: IMachinery) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setLocalMachinery(prev => prev.filter(m => m._id !== (row as any)._id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                fieldConfigurations={{
                  machinery: {
                    type: "select",
                    options: getFormOptions.machinery,
                    placeholder: "Seleccione una maquinaria"
                  },
                  startTime: {
                    type: "text",
                    placeholder: "HH:MM"
                  },
                  endTime: {
                    type: "text",
                    placeholder: "HH:MM"
                  },
                  finalHours: {
                    type: "number",
                    placeholder: "Total de horas trabajadas"
                  },
                  timeValue: {
                    type: "number",
                    placeholder: "Valor por unidad de tiempo"
                  },
                  totalValue: {
                    type: "number",
                    placeholder: "Valor total de la maquinaria"
                  }
                }}
                enableInlineAdd={true}
                enableInlineEdit={true}
                editableColumns={["machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"]}
                addableColumns={["machinery", "startTime", "endTime", "finalHours", "timeValue", "totalValue"]}
                defaultNewRow={{
                  machinery: "",
                  startTime: "",
                  endTime: "",
                  finalHours: 0,
                  timeValue: 0,
                  totalValue: 0
                }}
                onEditSave={async (originalRow, updatedRow) => {
                  setLocalMachinery(prev => 
                    prev.map(m => m._id === originalRow._id ? { ...updatedRow } : m)
                  );
                }}
                onInlineAdd={async (newMachine) => {
                  const machineWithId = {
                    ...newMachine,
                    _id: `machinery-${Date.now()}-${Math.random()}`
                  };
                  setLocalMachinery(prev => [...prev, machineWithId]);
                }}
                />
            </div>
          </div>
        ),
        isOptional: true
      });
    }

    console.log('🏗️ Final wizard steps built:', {
      totalSteps: steps.length,
      stepIds: steps.map(s => s.id),
      stepTitles: steps.map(s => s.title)
    });

    return steps;
  };

  const handleComplete = async (formData: any) => {
    // Construir el objeto IWork completo con los datos del wizard
    const workData: Partial<IWork> = {
      // Campos básicos del trabajo (ahora sin prefijo workData)
      orderNumber: formData.orderNumber,
      executionDate: formData.executionDate,
      barracks: formData.barracks,
      species: formData.species,
      variety: formData.variety,
      workState: formData.workState,
      syncApp: formData.syncApp,
      startDate: formData.executionDate, // Asignar fecha actual
      endDate: formData.executionDate,   // Asignar fecha actual
      
      // Arrays de workers, machinery y products desde los estados locales
      workers: formData.needsHumanResources === "yes" ? localWorkers : [],
      products: formData.needsWarehouseProducts === "yes" ? localProducts : [],
      machinery: formData.needsMachinery === "yes" ? localMachinery : []
    };

    const workAssociationData: WorkAssociationData = {
      associateWork: true,
      entityType,
      entityId: entityData.id || entityData._id || "",
      workData
    };

    await onComplete(workAssociationData);
  };

  // Build steps dinamically using the extended generic Wizard
  const allSteps = useMemo(() => {
    const steps = buildWizardSteps();
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Rebuilding wizard steps:', {
        needsHumanResources,
        needsWarehouseProducts,
        needsMachinery,
        localWorkersCount: localWorkers.length,
        localProductsCount: localProducts.length,
        localMachineryCount: localMachinery.length,
        totalSteps: steps.length,
        stepIds: steps.map(s => s.id)
      });
    }
    return steps;
  }, [
    needsHumanResources, 
    needsWarehouseProducts, 
    needsMachinery,
    localWorkers,      // ⭐ AGREGADO
    localProducts,     // ⭐ AGREGADO  
    localMachinery,    // ⭐ AGREGADO
    getFormOptions     // ⭐ AGREGADO para que se actualicen las opciones también
  ]);

  // Use the generic Wizard component with our dynamic steps
  return (
    <Wizard
      title="Asociación de Trabajo"
      description="Configure la información del trabajo a asociar"
      steps={allSteps}
      onComplete={handleComplete}
      onCancel={onCancel}
      defaultValues={finalDefaultValues}
      fieldRules={wizardRules}
      showProgress={true}
      allowSkipOptional={true}
      submitButtonText="Confirmar e Insertar"
      cancelButtonText="Cancelar"
      nextButtonText="Siguiente"
      previousButtonText="Anterior"
    />
  );
};

export default WorkAssociationWizard;
