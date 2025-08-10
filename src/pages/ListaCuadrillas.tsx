import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Users,
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
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { ICrewList } from "@eon-lib/eon-mongoose";
import crewListService from "@/_services/crewListService";
import { toast } from "@/components/ui/use-toast";

// Render function for the state column (boolean)
const renderState = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Activo</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>Inactivo</span>
    </div>
  );
};

// Column configuration for the grid - based on CrewList model
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "groupNumber",
    header: "Número de Grupo",
    accessor: "groupNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "endDate",
    header: "Fecha Fin",
    accessor: "endDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "searchBy",
    header: "Buscar por",
    accessor: "searchBy",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "groupBoss",
    header: "Jefe de Grupo",
    accessor: "groupBoss",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "contractorRut",
    header: "RUT Contratista",
    accessor: "contractorRut",
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
    render: renderState,
  }
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Cuadrilla #{row.groupNumber}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha Fin:</strong> {row.endDate}
        </p>
        <p>
          <strong>Buscar por:</strong> {row.searchBy}
        </p>
      </div>
      <div>
        <p>
          <strong>Jefe de Grupo:</strong> {row.groupBoss}
        </p>
        <p>
          <strong>RUT Contratista:</strong> {row.contractorRut}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new crew list - matches the model structure
const formSections: SectionConfig[] = [
  {
    id: "crewlist-info",
    title: "Información de la Cuadrilla",
    description: "Ingrese los datos de la nueva cuadrilla",
    fields: [
      {
        id: "groupNumber",
        type: "number",
        label: "Número de Grupo",
        name: "groupNumber",
        placeholder: "Ej: 1, 2, 3...",
        required: true,
        helperText: "Número identificativo del grupo"
      },
      {
        id: "endDate",
        type: "text",
        label: "Fecha Fin",
        name: "endDate",
        required: true,
        helperText: "Fecha de finalización",
        defaultValue: "",
        // pattern: "\\d{4}-\\d{2}-\\d{2}"
      },
      {
        id: "searchBy",
        type: "text",
        label: "Buscar por",
        name: "searchBy",
        placeholder: "Criterio de búsqueda",
        required: true,
        helperText: "Criterio para buscar la cuadrilla"
      },
      {
        id: "groupBoss",
        type: "text",
        label: "Jefe de Grupo",
        name: "groupBoss",
        placeholder: "Nombre del jefe de grupo",
        required: true,
        helperText: "Nombre completo del jefe de grupo"
      },
      {
        id: "contractorRut",
        type: "text",
        label: "RUT Contratista",
        name: "contractorRut",
        placeholder: "Ej: 12345678-9",
        required: true,
        helperText: "RUT del contratista responsable"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la cuadrilla está actualmente en uso"
      },
    ],
  }
];

// Form validation schema - matches the model requirements
const formValidationSchema = z.object({
  groupNumber: z.number().min(1, { message: "El número de grupo debe ser mayor a 0" }),
  endDate: z.string().min(1, { message: "La fecha fin es obligatoria" }),
  searchBy: z.string().min(1, { message: "El criterio de búsqueda es obligatorio" }),
  groupBoss: z.string().min(1, { message: "El jefe de grupo es obligatorio" }),
  contractorRut: z.string().min(1, { message: "El RUT del contratista es obligatorio" }),
  state: z.boolean().default(true)
});

const ListaCuadrillas = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [crewLists, setCrewLists] = useState<ICrewList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrewList, setSelectedCrewList] = useState<ICrewList | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch crewLists on component mount
  useEffect(() => {
    fetchCrewLists();
  }, []);
  
  // Function to fetch crew lists data
  const fetchCrewLists = async () => {
    setIsLoading(true);
    try {
      const result = await crewListService.findAll();
      // Comprobar si la respuesta tiene un formato diferente
      if (result && typeof result === 'object' && 'data' in result) {
        setCrewLists(result.data as ICrewList[]);
      } else {
        // Si la respuesta es un array directo
        setCrewLists(result as ICrewList[]);
      }
    } catch (error) {
      console.error("Error loading crew lists:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuadrillas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new crew list
  const handleAddCrewList = async (data: Partial<ICrewList>) => {
    try {
      // Preparar datos según la estructura exacta del modelo
      const crewListData: Partial<ICrewList> = {
        endDate: data.endDate ? String(data.endDate) : "",
        groupNumber: data.groupNumber,
        searchBy: data.searchBy,
        groupBoss: data.groupBoss,
        contractorRut: data.contractorRut,
        state: data.state !== undefined ? data.state : true
      };
      
      const newCrewList = await crewListService.createCrew(crewListData);
      
      // Update the list with the new item
      setCrewLists(prev => [...prev, newCrewList]);
      
      // Close the dialog and show success message
      setIsDialogOpen(false);
      toast({
        title: "Cuadrilla creada",
        description: `La cuadrilla #${newCrewList.groupNumber} ha sido creada con éxito`,
      });
    } catch (error) {
      console.error("Error creating crew list:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cuadrilla",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle updating a crew list
  const handleUpdateCrewList = async (id: string | number, data: Partial<ICrewList>) => {
    try {
      // Preparar datos según la estructura exacta del modelo
      const crewListData: Partial<ICrewList> = {
        endDate: data.endDate ? String(data.endDate) : "",
        groupNumber: data.groupNumber,
        searchBy: data.searchBy,
        groupBoss: data.groupBoss,
        contractorRut: data.contractorRut,
        state: data.state
      };
      
      const updatedCrewList = await crewListService.updateCrew(id, crewListData);
      
      // Update the list with the updated item
      setCrewLists(prev => 
        prev.map(item => item._id === id ? updatedCrewList : item)
      );
      
      // Close the dialog and show success message
      setIsDialogOpen(false);
      toast({
        title: "Cuadrilla actualizada",
        description: `La cuadrilla #${updatedCrewList.groupNumber} ha sido actualizada con éxito`,
      });
    } catch (error) {
      console.error(`Error updating crew list ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cuadrilla",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle deleting a crew list
  const handleDeleteCrewList = async (id: string | number) => {
    try {
      await crewListService.softDeleteCrew(id);
      
      // Update the list - either remove or mark as inactive
      // @ts-ignore
      setCrewLists(prev => 
        prev.map(item => item._id === id ? { ...item, state: false } : item)
      );
      
      toast({
        title: "Cuadrilla desactivada",
        description: "La cuadrilla ha sido desactivada con éxito",
      });
    } catch (error) {
      console.error(`Error deleting crew list ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo desactivar la cuadrilla",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle form submission (create or update)
  const handleFormSubmit = (data: Partial<ICrewList>) => {
    if (isEditMode && selectedCrewList?._id) {
      handleUpdateCrewList(selectedCrewList._id, data);
    } else {
      handleAddCrewList(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (crewList: ICrewList) => {
    // Asegurarse de que la fecha sea un string en el formato correcto
    const formattedCrewList = {
      ...crewList,
      endDate: crewList.endDate ? String(crewList.endDate).split('T')[0] : ""
    };
    // @ts-ignore
    setSelectedCrewList(formattedCrewList);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column with edit and delete buttons
  const renderActions = (row: ICrewList) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteCrewList(row._id!)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de Cuadrillas</h1>
          <p className="text-muted-foreground">
            Gestiona la información de las cuadrillas de trabajo
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCrewList(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cuadrilla
        </Button>
      </div>

      {/* Grid for displaying crew lists data */}
      <Grid
        columns={columns}
        data={crewLists}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="crewLists"
        title="Lista de Cuadrillas"
      />

      {/* Dialog for adding/editing crew lists */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Cuadrilla" : "Agregar Cuadrilla"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique la información de la cuadrilla existente"
                : "Complete el formulario para agregar una nueva cuadrilla"}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedCrewList ? selectedCrewList : undefined}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaCuadrillas; 