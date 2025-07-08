import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IWorkerList } from "@/types/IWorkerList";
import workerListService from "@/_services/workerListService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";

// Render function for the boolean columns
const renderBoolean = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Sí</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>No</span>
    </div>
  );
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
    id: "rut",
    header: "RUT",
    accessor: "rut",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "names",
    header: "Nombres",
    accessor: "names",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "lastName",
    header: "Apellido",
    accessor: "lastName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "secondLastName",
    header: "Segundo Apellido",
    accessor: "secondLastName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sex",
    header: "Sexo",
    accessor: "sex",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "startDate",
    header: "Fecha Inicio",
    accessor: "startDate",
    visible: true,
    sortable: true,
  },
  {
    id: "provisionalRegime",
    header: "Régimen Provisional",
    accessor: "provisionalRegime",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "provision",
    header: "Previsión",
    accessor: "provision",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "socialSecurity",
    header: "Seguridad Social",
    accessor: "socialSecurity",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "state",
    header: "Estado",
    accessor: "state",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  }
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">{row.names} {row.lastName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Información Personal</h4>
        <p><strong>RUT:</strong> {row.rut}</p>
        <p><strong>Nacionalidad:</strong> {row.workerNationality}</p>
        <p><strong>RUT/DNI Nacionalidad:</strong> {row.rutDniNationality}</p>
        <p><strong>Tipo Documento:</strong> {row.identificationDocumentType}</p>
        <p><strong>Código Interno:</strong> {row.internalCod}</p>
        <p><strong>Fecha Nacimiento:</strong> {row.birthDate}</p>
        <p><strong>Estado Civil:</strong> {row.civilState}</p>
        <p><strong>Dirección:</strong> {row.address}</p>
        <p><strong>Ciudad:</strong> {row.city}</p>
        <p><strong>Región:</strong> {row.region}</p>
        <p><strong>País:</strong> {row.country}</p>
        <p><strong>Teléfono:</strong> {row.phone}</p>
        <p><strong>Email:</strong> {row.email}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Información Laboral</h4>
        <p><strong>Clasificación:</strong> {row.classify}</p>
        <p><strong>Tipo Contrato:</strong> {row.contractType}</p>
        <p><strong>Fecha Inicio:</strong> {row.startDate}</p>
        <p><strong>Fecha Fin:</strong> {row.endDate}</p>
        <p><strong>Función:</strong> {row.contractFunction}</p>
        <p><strong>Salario Base:</strong> {row.baseSalary}</p>
        <p><strong>Tipo Cálculo:</strong> {row.calculationType}</p>
        <p><strong>Estado Trabajador:</strong> {row.workerListState}</p>
        <p><strong>Tipo Trabajo:</strong> {row.workType}</p>
        <p><strong>Administrativo:</strong> {row.administrative ? "Sí" : "No"}</p>
        <p><strong>Dispensador:</strong> {row.dispenser ? "Sí" : "No"}</p>
        <p><strong>Aplicador:</strong> {row.applicator}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Previsión y Salud</h4>
        <p><strong>Previsión:</strong> {row.provision}</p>
        <p><strong>Régimen Provisional:</strong> {row.provisionalRegime ? "Sí" : "No"}</p>
        <p><strong>Seguridad Social:</strong> {row.socialSecurity}</p>
        <p><strong>Salud:</strong> {row.health}</p>
        <p><strong>Valor Salud:</strong> {row.valueHealth}</p>
        <p><strong>CCAF:</strong> {row.ccaf}</p>
        <p><strong>Tipo Pago:</strong> {row.paymentType}</p>
        <p><strong>Banco:</strong> {row.bank}</p>
        <p><strong>Número Cuenta:</strong> {row.accountNumber}</p>
        <p><strong>Tipo Cuenta:</strong> {row.accountType}</p>
        <p><strong>Email Trabajador:</strong> {row.workerEmail}</p>
      </div>
    </div>
  </div>
);

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  // Campos obligatorios
  rutDniNationality: z.string().min(1, { message: "El RUT/DNI nacionalidad es obligatorio" }),
  rut: z.string().min(1, { message: "El RUT es obligatorio" }),
  names: z.string().min(1, { message: "Los nombres son obligatorios" }),
  lastName: z.string().min(1, { message: "El apellido es obligatorio" }),
  secondLastName: z.string().min(1, { message: "El segundo apellido es obligatorio" }),
  sex: z.string().min(1, { message: "El sexo es obligatorio" }),
  property: z.string().min(1, { message: "La propiedad es obligatoria" }),
  provisionalRegime: z.boolean().default(true),
  startDate: z.string().min(1, { message: "La fecha de inicio es obligatoria" }),
  provision: z.string().min(1, { message: "La previsión es obligatoria" }),
  socialSecurity: z.string().min(1, { message: "La seguridad social es obligatoria" }),
  
  // Campos opcionales
  workerNationality: z.string().optional(),
  identificationDocumentType: z.string().optional(),
  internalCod: z.string().optional(),
  birthDate: z.string().optional(),
  civilState: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  recordType: z.string().optional(),
  workerListId: z.string().optional(),
  
  // Campos de certificación
  administrative: z.boolean().optional(),
  dispenser: z.boolean().optional(),
  dispenserResponsible: z.boolean().optional(),
  dispenserChecker: z.string().optional(),
  certificationNumber: z.string().optional(),
  applicator: z.string().optional(),
  applicatorResponsible: z.boolean().optional(),
  applicatorChecker: z.boolean().optional(),
  institution: z.string().optional(),
  expirationDate: z.string().optional(),
  
  // Campos de contrato
  classify: z.string().optional(),
  contractType: z.string().optional(),
  contractDocument: z.string().optional(),
  contractAnnexed: z.string().optional(),
  baseSalary: z.number().optional(),
  calculationType: z.string().optional(),
  endDate: z.string().optional(),
  contractFunction: z.string().optional(),
  workerListState: z.string().optional(),
  stateCDate: z.string().optional(),
  stateCUser: z.string().optional(),
  observation: z.string().optional(),
  
  state: z.boolean().default(true)
});

// Form configuration for adding new Lista Trabajadores
const formSections: SectionConfig[] = [
  {
    id: "personal-info",
    title: "Información Personal",
    description: "Ingrese los datos personales del trabajador",
    fields: [
      {
        id: "rut",
        type: "text",
        label: "RUT",
        name: "rut",
        placeholder: "Ej: 12345678-9",
        required: true,
        helperText: "RUT del trabajador"
      },
      {
        id: "rutDniNationality",
        type: "text",
        label: "RUT/DNI Nacionalidad",
        name: "rutDniNationality",
        placeholder: "Ingrese RUT/DNI según nacionalidad",
        required: true,
        helperText: "Documento de identidad según nacionalidad"
      },
      {
        id: "names",
        type: "text",
        label: "Nombres",
        name: "names",
        placeholder: "Nombres del trabajador",
        required: true,
        helperText: "Nombres completos del trabajador"
      },
      {
        id: "lastName",
        type: "text",
        label: "Apellido",
        name: "lastName",
        placeholder: "Primer apellido",
        required: true,
        helperText: "Primer apellido del trabajador"
      },
      {
        id: "secondLastName",
        type: "text",
        label: "Segundo Apellido",
        name: "secondLastName",
        placeholder: "Segundo apellido",
        required: true,
        helperText: "Segundo apellido del trabajador"
      },
      {
        id: "sex",
        type: "select",
        label: "Sexo",
        name: "sex",
        required: true,
        options: [
          { value: "M", label: "Masculino" },
          { value: "F", label: "Femenino" },
          { value: "O", label: "Otro" }
        ],
        helperText: "Sexo del trabajador"
      },
      {
        id: "workerNationality",
        type: "text",
        label: "Nacionalidad",
        name: "workerNationality",
        placeholder: "Nacionalidad del trabajador",
        helperText: "Nacionalidad del trabajador"
      },
      {
        id: "identificationDocumentType",
        type: "text",
        label: "Tipo Documento Identificación",
        name: "identificationDocumentType",
        placeholder: "Tipo de documento",
        helperText: "Tipo de documento de identificación"
      },
      {
        id: "internalCod",
        type: "text",
        label: "Código Interno",
        name: "internalCod",
        placeholder: "Código interno",
        helperText: "Código interno del trabajador"
      },
      {
        id: "birthDate",
        type: "date",
        label: "Fecha de Nacimiento",
        name: "birthDate",
        helperText: "Fecha de nacimiento del trabajador"
      },
      {
        id: "civilState",
        type: "select",
        label: "Estado Civil",
        name: "civilState",
        options: [
          { value: "Soltero", label: "Soltero" },
          { value: "Casado", label: "Casado" },
          { value: "Divorciado", label: "Divorciado" },
          { value: "Viudo", label: "Viudo" },
          { value: "Conviviente", label: "Conviviente" }
        ],
        helperText: "Estado civil del trabajador"
      },
      {
        id: "address",
        type: "text",
        label: "Dirección",
        name: "address",
        placeholder: "Dirección completa",
        helperText: "Dirección del trabajador"
      },
      {
        id: "city",
        type: "text",
        label: "Ciudad",
        name: "city",
        placeholder: "Ciudad",
        helperText: "Ciudad del trabajador"
      },
      {
        id: "region",
        type: "text",
        label: "Región",
        name: "region",
        placeholder: "Región",
        helperText: "Región del trabajador"
      },
      {
        id: "country",
        type: "text",
        label: "País",
        name: "country",
        placeholder: "País",
        helperText: "País del trabajador"
      },
      {
        id: "phone",
        type: "text",
        label: "Teléfono",
        name: "phone",
        placeholder: "Número de teléfono",
        helperText: "Número de teléfono del trabajador"
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        name: "email",
        placeholder: "email@ejemplo.com",
        helperText: "Correo electrónico del trabajador"
      }
    ]
  },
  {
    id: "work-info",
    title: "Información Laboral",
    description: "Ingrese los datos laborales del trabajador",
    fields: [
      {
        id: "startDate",
        type: "date",
        label: "Fecha de Inicio",
        name: "startDate",
        required: true,
        helperText: "Fecha de inicio del trabajador"
      },
      {
        id: "endDate",
        type: "date",
        label: "Fecha de Fin",
        name: "endDate",
        helperText: "Fecha de fin del contrato (opcional)"
      },
      {
        id: "contractType",
        type: "text",
        label: "Tipo de Contrato",
        name: "contractType",
        placeholder: "Tipo de contrato",
        helperText: "Tipo de contrato laboral"
      },
      {
        id: "baseSalary",
        type: "number",
        label: "Salario Base",
        name: "baseSalary",
        placeholder: "0",
        helperText: "Salario base del trabajador"
      },
      {
        id: "contractFunction",
        type: "text",
        label: "Función en el Contrato",
        name: "contractFunction",
        placeholder: "Función del trabajador",
        helperText: "Función específica del trabajador"
      },
      {
        id: "administrative",
        type: "checkbox",
        label: "Administrativo",
        name: "administrative",
        helperText: "Indica si es personal administrativo"
      },
      {
        id: "dispenser",
        type: "checkbox",
        label: "Dispensador",
        name: "dispenser",
        helperText: "Indica si es dispensador"
      },
      {
        id: "dispenserResponsible",
        type: "checkbox",
        label: "Responsable Dispensador",
        name: "dispenserResponsible",
        helperText: "Indica si es responsable de dispensador"
      },
      {
        id: "applicatorResponsible",
        type: "checkbox",
        label: "Responsable Aplicador",
        name: "applicatorResponsible",
        helperText: "Indica si es responsable de aplicador"
      },
      {
        id: "applicatorChecker",
        type: "checkbox",
        label: "Verificador Aplicador",
        name: "applicatorChecker",
        helperText: "Indica si es verificador de aplicador"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observaciones",
        name: "observation",
        placeholder: "Observaciones adicionales",
        helperText: "Observaciones sobre el trabajador"
      }
    ]
  },
  {
    id: "provision-info",
    title: "Previsión y Salud",
    description: "Ingrese los datos de previsión y salud",
    fields: [
      {
        id: "provision",
        type: "text",
        label: "Previsión",
        name: "provision",
        placeholder: "Institución de previsión",
        required: true,
        helperText: "Institución de previsión del trabajador"
      },
      {
        id: "provisionalRegime",
        type: "checkbox",
        label: "Régimen Provisional",
        name: "provisionalRegime",
        required: true,
        helperText: "Indica si está en régimen provisional"
      },
      {
        id: "socialSecurity",
        type: "text",
        label: "Seguridad Social",
        name: "socialSecurity",
        placeholder: "Institución de seguridad social",
        required: true,
        helperText: "Institución de seguridad social"
      },
      {
        id: "health",
        type: "text",
        label: "Salud",
        name: "health",
        placeholder: "Sistema de salud",
        helperText: "Sistema de salud del trabajador"
      },
      {
        id: "valueHealth",
        type: "number",
        label: "Valor Salud",
        name: "valueHealth",
        placeholder: "0",
        helperText: "Valor del plan de salud"
      },
      {
        id: "ccaf",
        type: "text",
        label: "CCAF",
        name: "ccaf",
        placeholder: "Caja de compensación",
        helperText: "Caja de compensación de asignación familiar"
      }
    ]
  },
  {
    id: "payment-info",
    title: "Información de Pago",
    description: "Ingrese los datos bancarios y de pago",
    fields: [
      {
        id: "paymentType",
        type: "select",
        label: "Tipo de Pago",
        name: "paymentType",
        options: [
          { value: "Transferencia", label: "Transferencia Bancaria" },
          { value: "Efectivo", label: "Efectivo" },
          { value: "Cheque", label: "Cheque" }
        ],
        helperText: "Tipo de pago del trabajador"
      },
      {
        id: "bank",
        type: "text",
        label: "Banco",
        name: "bank",
        placeholder: "Nombre del banco",
        helperText: "Banco del trabajador"
      },
      {
        id: "accountNumber",
        type: "number",
        label: "Número de Cuenta",
        name: "accountNumber",
        placeholder: "Número de cuenta bancaria",
        helperText: "Número de cuenta bancaria"
      },
      {
        id: "accountType",
        type: "select",
        label: "Tipo de Cuenta",
        name: "accountType",
        options: [
          { value: "Corriente", label: "Cuenta Corriente" },
          { value: "Ahorro", label: "Cuenta de Ahorro" },
          { value: "Vista", label: "Cuenta Vista" }
        ],
        helperText: "Tipo de cuenta bancaria"
      },
      {
        id: "workerEmail",
        type: "email",
        label: "Email para Pagos",
        name: "workerEmail",
        placeholder: "email@ejemplo.com",
        helperText: "Email para notificaciones de pago"
      }
    ]
  },
  {
    id: "status-info",
    title: "Estado",
    description: "Configure el estado del trabajador",
    fields: [
      {
        id: "state",
        type: "checkbox",
        label: "Estado Activo",
        name: "state",
        required: true,
        helperText: "Indica si el trabajador está activo"
      }
    ]
  }
];

const ListaTrabajadores = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workerList, setWorkerList] = useState<IWorkerList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<IWorkerList | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from auth store
  const { propertyId } = useAuthStore();
  
  // Fetch worker list on component mount and when propertyId changes
  useEffect(() => {
    console.log('🔄 ListaTrabajadores useEffect triggered - propertyId:', propertyId);
    if (propertyId) {
      fetchWorkerList();
    } else {
      console.log('⚠️ No propertyId available, skipping fetch');
      setWorkerList([]);
    }
  }, [propertyId]);
  
  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 workerList state updated:', {
      length: workerList.length,
      data: workerList,
      isArray: Array.isArray(workerList)
    });
  }, [workerList]);
  
  // Function to fetch worker list data
  const fetchWorkerList = async () => {
    if (!propertyId) {
      console.log('❌ Cannot fetch workers: no propertyId');
      toast({
        title: "Error",
        description: "No hay una propiedad seleccionada",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('🚀 Starting fetchWorkerList with propertyId:', propertyId);
    
    try {
      const rawData = await workerListService.findAll();
      console.log('📥 Raw data received from service:', rawData);
      
      // Handle potential double-wrapped data
      let processedData: IWorkerList[];
      
      if (Array.isArray(rawData)) {
        processedData = rawData;
        console.log('✅ Data is already an array');
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
        processedData = (rawData as any).data;
        console.log('✅ Extracted data from .data property');
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && (rawData as any).data && typeof (rawData as any).data === 'object' && 'data' in (rawData as any).data && Array.isArray((rawData as any).data.data)) {
        processedData = (rawData as any).data.data;
        console.log('✅ Extracted data from nested .data.data property');
      } else {
        console.error('❌ Unexpected data structure:', rawData);
        processedData = [];
      }
      
      console.log('🔍 Processed data:', {
        length: processedData.length,
        sample: processedData.slice(0, 2),
        isArray: Array.isArray(processedData)
      });
      
      setWorkerList(processedData);
      
      if (processedData.length === 0) {
        console.log('ℹ️ No workers found for this property');
        toast({
          title: "Sin datos",
          description: "No se encontraron trabajadores para esta propiedad",
        });
      } else {
        console.log(`✅ Successfully loaded ${processedData.length} workers`);
      }
      
    } catch (error) {
      console.error("💥 Error loading worker list:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setWorkerList([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchWorkerList completed');
    }
  };
  
  // Function to handle adding a new worker
  const handleAddWorker = async (data: Partial<IWorkerList>) => {
    try {
      // Add property field with current propertyId
      const workerData = {
        ...data,
        property: propertyId?.toString() || ""
      };
      console.log("workerlistData to insert", workerData);
      
      const newWorker = await workerListService.createWorkerList(workerData);
      await fetchWorkerList();
      setIsDialogOpen(false);
      toast({
        title: "Trabajador creado",
        description: `El trabajador ${newWorker.names} ${newWorker.lastName} ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating worker:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el trabajador. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing worker
  const handleUpdateWorker = async (id: string | number, data: Partial<IWorkerList>) => {
    try {
      const updatedWorker = await workerListService.updateWorkerList(id, data);
      await fetchWorkerList();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedWorker(null);
      toast({
        title: "Trabajador actualizado",
        description: `El trabajador ${data.names} ${data.lastName} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating worker:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el trabajador. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a worker
  const handleDeleteWorker = async (id: string | number) => {
    try {
      await workerListService.softDeleteWorkerList(id);
      setWorkerList((prev) => prev.filter((worker) => worker._id !== id));
      toast({
        title: "Trabajador eliminado",
        description: "El trabajador ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajador. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (worker: IWorkerList) => {
    setSelectedWorker(worker);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission (determines whether to create or update)
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedWorker?._id) {
      handleUpdateWorker(selectedWorker._id, data);
    } else {
      handleAddWorker(data);
    }
  };

  // Handle opening dialog for new worker
  const handleOpenDialog = () => {
    setSelectedWorker(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista Trabajadores</h1>
          <p className="text-muted-foreground">
            Administra y visualiza la información de los trabajadores de la empresa.
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Trabajador
        </Button>
      </div>

      <Grid
        gridId="lista-trabajadores-grid"
        data={workerList}
        columns={columns}
        idField="_id"
        title={`Lista de Trabajadores (${workerList.length} registros)`}
        expandableContent={expandableContent}
        actions={(row: IWorkerList) => (
          <div className="flex space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              size="sm"
              variant="ghost"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Está seguro que desea eliminar al trabajador ${row.names} ${row.lastName}?`)) {
                  handleDeleteWorker(row._id as string);
                }
              }}
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        key={`trabajadores-grid-${workerList.length}-${propertyId}`}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Trabajador" : "Añadir Nuevo Trabajador"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar la información del trabajador." 
                : "Complete el formulario para añadir un nuevo trabajador al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedWorker 
                ? {
                    // Personal info
                    rut: selectedWorker.rut || "",
                    rutDniNationality: selectedWorker.rutDniNationality || "",
                    names: selectedWorker.names || "",
                    lastName: selectedWorker.lastName || "",
                    secondLastName: selectedWorker.secondLastName || "",
                    sex: selectedWorker.sex || "",
                    workerNationality: selectedWorker.workerNationality || "",
                    identificationDocumentType: selectedWorker.identificationDocumentType || "",
                    internalCod: selectedWorker.internalCod || "",
                    birthDate: selectedWorker.birthDate || "",
                    civilState: selectedWorker.civilState || "",
                    address: selectedWorker.address || "",
                    city: selectedWorker.city || "",
                    region: selectedWorker.region || "",
                    country: selectedWorker.country || "",
                    phone: selectedWorker.phone || "",
                    email: selectedWorker.email || "",
                    
                    // Work info
                    startDate: selectedWorker.startDate || "",
                    endDate: selectedWorker.endDate || "",
                    contractType: selectedWorker.contractType || "",
                    baseSalary: selectedWorker.baseSalary || 0,
                    contractFunction: selectedWorker.contractFunction || "",
                    administrative: selectedWorker.administrative || false,
                    dispenser: selectedWorker.dispenser || false,
                    dispenserResponsible: selectedWorker.dispenserResponsible || false,
                    applicatorResponsible: selectedWorker.applicatorResponsible || false,
                    applicatorChecker: selectedWorker.applicatorChecker || false,
                    observation: selectedWorker.observation || "",
                    
                    // Provision info
                    provision: selectedWorker.provision || "",
                    provisionalRegime: selectedWorker.provisionalRegime || true,
                    socialSecurity: selectedWorker.socialSecurity || "",
                    health: selectedWorker.health || "",
                    valueHealth: selectedWorker.valueHealth || 0,
                    ccaf: selectedWorker.ccaf || "",
                    
                    // Payment info
                    paymentType: selectedWorker.paymentType || "",
                    bank: selectedWorker.bank || "",
                    accountNumber: selectedWorker.accountNumber || 0,
                    accountType: selectedWorker.accountType || "",
                    workerEmail: selectedWorker.workerEmail || "",
                    
                    // Status
                    state: selectedWorker.state !== undefined ? selectedWorker.state : true,
                    property: selectedWorker.property || propertyId?.toString() || ""
                  }
                : {
                    // Default values for new worker
                    provisionalRegime: true,
                    state: true,
                    property: propertyId?.toString() || ""
                  }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaTrabajadores; 