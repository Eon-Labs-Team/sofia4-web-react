import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTubeDiagonal, 
  Package, 
  Wrench, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";
import type { WorkType, WorkTypeSelectorOption } from "./shared/types/workTypes";
import { WORK_TYPES } from "./shared/types/workTypes";

// Importar configuraciones específicas
import { aplicacionConfig } from "./aplicacion/configs/aplicacionConfig";
import { cosechaConfig } from "./cosecha/configs/cosechaConfig";
import { trabajoConfig } from "./trabajo/configs/trabajoConfig";

// Importar hooks y componentes base
import { useWorkData } from "./shared/hooks/useWorkData";
import BaseWorkGrid from "./shared/components/BaseWorkGrid";
import BaseWorkForm from "./shared/components/BaseWorkForm";

// Importar reglas de campo específicas (por ahora solo para aplicación)
import { createOrdenAplicacionRules } from "@/lib/fieldRules/ordenAplicacionRules";
import { createTrabajoAgricolaRules } from "@/lib/fieldRules/trabajoAgricolaRules";

interface WorkManagerProps {
  // Prop opcional para forzar un tipo específico
  defaultWorkType?: WorkType;
  // Prop para ocultar el selector de tipo (útil para mantener compatibilidad)
  hideTypeSelector?: boolean;
}

/**
 * Configuración de tipos de trabajo disponibles
 */
const WORK_TYPE_CONFIGS = {
  A: aplicacionConfig,
  C: cosechaConfig,
  T: trabajoConfig,
} as const;

/**
 * Componente principal que orquesta todos los tipos de trabajo
 */
const WorkManager: React.FC<WorkManagerProps> = ({
  defaultWorkType = 'A',
  hideTypeSelector = false,
}) => {
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>(defaultWorkType);
  
  // Hook de datos para el tipo de trabajo seleccionado
  const {
    state,
    masterData,
    isLoadingMasterData,
    updateState,
    selectWork,
    createWork,
    updateWork,
    deleteWork,
    refreshData,
  } = useWorkData(selectedWorkType);

  // Configuración activa basada en el tipo seleccionado
  const activeConfig = WORK_TYPE_CONFIGS[selectedWorkType];

  // Opciones para el selector de tipo de trabajo
  const workTypeOptions: WorkTypeSelectorOption[] = useMemo(() => [
    {
      workType: 'A',
      label: WORK_TYPES.A.label,
      description: WORK_TYPES.A.description,
      icon: TestTubeDiagonal,
      isActive: selectedWorkType === 'A',
    },
    {
      workType: 'C',
      label: WORK_TYPES.C.label,
      description: WORK_TYPES.C.description,
      icon: Package,
      isActive: selectedWorkType === 'C',
    },
    {
      workType: 'T',
      label: WORK_TYPES.T.label,
      description: WORK_TYPES.T.description,
      icon: Wrench,
      isActive: selectedWorkType === 'T',
    },
  ], [selectedWorkType]);

  // Estadísticas basadas en los trabajos del tipo seleccionado
  const stats = useMemo(() => {
    const works = state.works;
    return {
      total: works.length,
      confirmed: works.filter(w => w.workState === 'confirmed').length,
      pending: works.filter(w => w.workState === 'pending').length,
      blocked: works.filter(w => w.workState === 'blocked').length,
    };
  }, [state.works]);

  // Reglas de campo específicas (por ahora solo para aplicación)
  const fieldRules = useMemo(() => {
    if (selectedWorkType === 'A') {
      return createOrdenAplicacionRules({
        cuartelesOptions: masterData.cuarteles,
        taskOptions: masterData.allTasks,
        taskTypeOptions: masterData.taskTypes,
        workerOptions: masterData.workerList.map(worker => ({
          ...worker,
          fullName: `${worker.names} ${worker.lastName}`
        })),
        cropTypesOptions: masterData.cropTypes,
        varietyTypesOptions: masterData.varietyTypes
      });
    }

    if (selectedWorkType === 'C') {
      return createOrdenAplicacionRules({
        cuartelesOptions: masterData.cuarteles,
        taskOptions: masterData.allTasks,
        taskTypeOptions: masterData.taskTypes,
        workerOptions: masterData.workerList.map(worker => ({
          ...worker,
          fullName: `${worker.names} ${worker.lastName}`
        })),
        cropTypesOptions: masterData.cropTypes,
        varietyTypesOptions: masterData.varietyTypes
      });
    }

    if (selectedWorkType === 'T') {
      return createTrabajoAgricolaRules({
        cuartelesOptions: masterData.cuarteles,
        taskOptions: masterData.allTasks,
        taskTypeOptions: masterData.taskTypes,
        workerOptions: masterData.workerList.map(worker => ({
          ...worker,
          fullName: `${worker.names} ${worker.lastName}`
        })),
        cropTypesOptions: masterData.cropTypes,
        varietyTypesOptions: masterData.varietyTypes
      });
    }
    // TODO: Implementar reglas para otros tipos de trabajo
    return undefined;
  }, [selectedWorkType, masterData]);

  /**
   * Manejar cambio de tipo de trabajo
   */
  const handleWorkTypeChange = (workType: WorkType) => {
    setSelectedWorkType(workType);
    // Resetear estado cuando cambiamos de tipo
    updateState({
      selectedWork: null,
      isDialogOpen: false,
      isWizardDialogOpen: false,
      isEditMode: false,
    });
  };

  /**
   * Manejar edición de trabajo
   */
  const handleEdit = (work: any) => {
    selectWork(work);
    updateState({ 
      isEditMode: true,
      isDialogOpen: true 
    });
  };

  /**
   * Manejar eliminación de trabajo
   */
  const handleDelete = async (work: any) => {
    if (window.confirm(`¿Está seguro que desea eliminar el trabajo ${work.orderNumber}?`)) {
      await deleteWork(work._id);
    }
  };

  /**
   * Manejar creación de nuevo trabajo
   */
  const handleNewWork = () => {
    selectWork(null);
    updateState({ 
      isEditMode: false,
      isDialogOpen: true 
    });
  };

  /**
   * Manejar envío del formulario
   */
  const handleFormSubmit = async (workData: any) => {
    if (state.isEditMode && state.selectedWork) {
      await updateWork(state.selectedWork._id, workData);
    } else {
      await createWork(workData);
    }
  };

  /**
   * Renderizar selector de tipo de trabajo
   */
  const renderWorkTypeSelector = () => {
    if (hideTypeSelector) return null;

    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Trabajos Agrícolas</h2>
        <Tabs value={selectedWorkType} onValueChange={(value) => handleWorkTypeChange(value as WorkType)}>
          <TabsList className="grid w-full grid-cols-3">
            {workTypeOptions.map((option) => (
              <TabsTrigger 
                key={option.workType} 
                value={option.workType}
                className="flex items-center space-x-2"
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {workTypeOptions.map((option) => (
            <TabsContent key={option.workType} value={option.workType} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <option.icon className="h-5 w-5" />
                    <span>{option.label}</span>
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  /**
   * Renderizar tarjetas de estadísticas
   */
  const renderStatsCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Trabajos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Trabajos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Trabajos pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <p className="text-xs text-muted-foreground">
              Trabajos bloqueados
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Renderizar panel de control
   */
  const renderControlPanel = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            Tipo: {activeConfig.title}
          </Badge>
          {isLoadingMasterData && (
            <Badge variant="secondary">
              Cargando datos...
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={state.isLoading}
          >
            Actualizar
          </Button>
          <Button
            onClick={handleNewWork}
            disabled={isLoadingMasterData}
          >
            Nuevo {activeConfig.title}
          </Button>
        </div>
      </div>
    );
  };

  if (isLoadingMasterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando datos maestros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderWorkTypeSelector()}
      {renderStatsCards()}
      {renderControlPanel()}
      
      {/* Grid principal */}
      <BaseWorkGrid
        workType={selectedWorkType}
        works={state.works}
        columns={activeConfig.gridColumns}
        isLoading={state.isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={refreshData}
      />

      {/* Formulario modal */}
      <BaseWorkForm
        workType={selectedWorkType}
        isOpen={state.isDialogOpen}
        onClose={() => updateState({ isDialogOpen: false })}
        onSubmit={handleFormSubmit}
        formSections={activeConfig.formSections}
        fieldRules={fieldRules}
        validationSchema={activeConfig.validationSchema}
        defaultValues={activeConfig.defaultValues}
        masterData={masterData}
        selectedWork={state.selectedWork}
        isEditMode={state.isEditMode}
        isSubmitting={state.isLoading}
      />
    </div>
  );
};

export default WorkManager;