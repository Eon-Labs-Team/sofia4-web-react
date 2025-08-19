import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/components/ui/use-toast";
import type { 
  IWork, 
  IWorkers, 
  IWorkerList, 
  IMachinery, 
  IMachineryList, 
  IProducts, 
  IProductCategory, 
  ITaskType, 
  ITask, 
  IWeatherCondition, 
  IWindCondition, 
  ICropType, 
  IVarietyType, 
  IOperationalArea 
} from "@eon-lib/eon-mongoose";
import type { WorkType, WorkMasterData, WorkComponentState } from "../types/workTypes";

// Services imports
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
import weatherConditionService from "@/_services/weatherConditionService";
import windConditionService from "@/_services/windConditionService";
import cropTypeService from "@/_services/cropTypeService";
import varietyTypeService from "@/_services/varietyTypeService";
import listaMaquinariasService from "@/_services/machineryListService";

/**
 * Hook principal para gestión de datos de trabajo
 * Parametrizado por workType para cargar datos específicos
 */
export const useWorkData = (workType: WorkType) => {
  const { propertyId } = useAuthStore();
  
  // Estado principal
  const [state, setState] = useState<WorkComponentState>({
    works: [],
    selectedWork: null,
    isLoading: false,
    isDialogOpen: false,
    isWizardDialogOpen: false,
    isEditMode: false,
    workWorkers: [],
    workMachinery: [],
    workProducts: [],
    showMap: false,
    showGantt: false,
    showActivity: true,
  });

  // Datos maestros
  const [masterData, setMasterData] = useState<WorkMasterData>({
    workers: [],
    workerList: [],
    machinery: [],
    machineryList: [],
    products: [],
    productCategories: [],
    taskTypes: [],
    allTasks: [],
    cuarteles: [],
    weatherConditions: [],
    windConditions: [],
    cropTypes: [],
    varietyTypes: [],
    warehouseProducts: [],
  });

  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  /**
   * Actualizar estado de manera inmutable
   */
  const updateState = useCallback((updates: Partial<WorkComponentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Cargar datos maestros (ejecutar una vez al montar)
   */
  const loadMasterData = useCallback(async () => {
    if (!propertyId) return;
    
    setIsLoadingMasterData(true);
    
    try {
      console.log(`Loading master data for workType: ${workType}, propertyId: ${propertyId}`);
      
      // Cargar datos en paralelo para mejor performance
      const [
        taskTypesData,
        allTasksData,
        cuartelesData,
        workerListData,
        machineryListData,
        productCategoriesData,
        warehouseProductsData,
        weatherConditionsData,
        windConditionsData,
        cropTypesData,
        varietyTypesData,
      ] = await Promise.all([
        // Filtrar taskTypes por workType específico
        faenaService.findAll().then(data => 
          Array.isArray(data) ? data.filter((taskType: any) => taskType.workType === workType) : []
        ),
        laborService.findAll(),
        listaCuartelesService.findAll(),
        workerListService.findAll(),
        listaMaquinariasService.findAll(),
        productCategoryService.findAll(),
        inventoryProductService.findAll(),
        weatherConditionService.findAll(),
        windConditionService.findAll(),
        cropTypeService.findAll(),
        varietyTypeService.findAll(),
      ]);

      const newMasterData: WorkMasterData = {
        workers: [], // Se cargan cuando se selecciona un trabajo
        workerList: Array.isArray(workerListData) ? workerListData : [],
        machinery: [], // Se cargan cuando se selecciona un trabajo
        machineryList: Array.isArray(machineryListData) ? machineryListData : [],
        products: [], // Se cargan cuando se selecciona un trabajo
        productCategories: Array.isArray(productCategoriesData) ? productCategoriesData : [],
        taskTypes: Array.isArray(taskTypesData) ? taskTypesData : [],
        allTasks: Array.isArray(allTasksData) ? allTasksData : [],
        cuarteles: Array.isArray(cuartelesData) ? cuartelesData : [],
        weatherConditions: Array.isArray(weatherConditionsData) ? weatherConditionsData : [],
        windConditions: Array.isArray(windConditionsData) ? windConditionsData : [],
        cropTypes: Array.isArray(cropTypesData) ? cropTypesData : [],
        varietyTypes: Array.isArray(varietyTypesData) ? varietyTypesData : [],
        warehouseProducts: Array.isArray(warehouseProductsData) ? warehouseProductsData : [],
      };

      setMasterData(newMasterData);
      console.log(`Master data loaded for ${workType}:`, newMasterData);
      
    } catch (error) {
      console.error(`Error loading master data for ${workType}:`, error);
      toast({
        title: "Error",
        description: `Error al cargar datos maestros para ${workType}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMasterData(false);
    }
  }, [propertyId, workType]);

  /**
   * Cargar trabajos filtrados por workType
   */
  const loadWorks = useCallback(async () => {
    if (!propertyId) return;
    
    updateState({ isLoading: true });
    
    try {
      console.log(`Loading works for workType: ${workType}, propertyId: ${propertyId}`);
      
      const data = await workService.findAll();
      const allWorksData = Array.isArray(data) ? data : (data as any)?.data || [];
      
      // Filtrar solo trabajos del tipo específico
      const filteredWorks = allWorksData.filter((work: IWork) => work.workType === workType);
      
      updateState({ 
        works: filteredWorks,
        isLoading: false 
      });
      
      console.log(`Works loaded for ${workType} (${filteredWorks.length} items):`, filteredWorks);
      
    } catch (error) {
      console.error(`Error loading works for ${workType}:`, error);
      updateState({ isLoading: false });
      toast({
        title: "Error",
        description: `Error al cargar trabajos de tipo ${workType}`,
        variant: "destructive",
      });
    }
  }, [propertyId, workType, updateState]);

  /**
   * Cargar entidades relacionadas a un trabajo específico
   */
  const loadWorkEntities = useCallback(async (workId: string) => {
    try {
      console.log(`Loading entities for work: ${workId}`);
      
      // Load all entities and filter by workId
      const [workersData, machineryData, productsData] = await Promise.all([
        workerService.findAll(),
        machineryService.findAll(),
        productService.findAll(),
      ]);

      // Filter by workId if needed (depends on API design)
      const filteredWorkers = Array.isArray(workersData) 
        ? workersData.filter((worker: any) => worker.workId === workId)
        : [];
      const filteredMachinery = Array.isArray(machineryData) 
        ? machineryData.filter((machinery: any) => machinery.workId === workId)
        : [];
      const filteredProducts = Array.isArray(productsData) 
        ? productsData.filter((product: any) => product.workId === workId)
        : [];

      updateState({
        workWorkers: filteredWorkers,
        workMachinery: filteredMachinery,
        workProducts: filteredProducts,
      });
      
      console.log(`Entities loaded for work ${workId}`);
      
    } catch (error) {
      console.error(`Error loading entities for work ${workId}:`, error);
      toast({
        title: "Error",
        description: "Error al cargar entidades del trabajo",
        variant: "destructive",
      });
    }
  }, [updateState]);

  /**
   * Seleccionar un trabajo y cargar sus entidades
   */
  const selectWork = useCallback(async (work: IWork | null) => {
    updateState({ selectedWork: work });
    
    if (work?._id) {
      await loadWorkEntities(work._id);
    } else {
      updateState({
        workWorkers: [],
        workMachinery: [],
        workProducts: [],
      });
    }
  }, [loadWorkEntities, updateState]);

  /**
   * Crear nuevo trabajo
   */
  const createWork = useCallback(async (workData: Partial<IWork>) => {
    try {
      updateState({ isLoading: true });
      
      const newWorkData = {
        ...workData,
        workType, // Asegurar que el workType sea correcto
        propertyId: String(propertyId), // Convert to string to match IWork interface
      };
      
      console.log(`Creating work of type ${workType}:`, newWorkData);
      
      // Use the appropriate create method based on workType
      const createdWork = workType === 'A' 
        ? await workService.createApplication(newWorkData)
        : await workService.createAgriculturalWork(newWorkData, propertyId);
      
      // Recargar lista de trabajos
      await loadWorks();
      
      updateState({ 
        isLoading: false,
        isDialogOpen: false,
        isWizardDialogOpen: false,
      });
      
      toast({
        title: "Éxito",
        description: "Trabajo creado exitosamente",
      });
      
      return createdWork;
      
    } catch (error) {
      console.error(`Error creating work of type ${workType}:`, error);
      updateState({ isLoading: false });
      toast({
        title: "Error",
        description: "Error al crear el trabajo",
        variant: "destructive",
      });
      throw error;
    }
  }, [workType, propertyId, loadWorks, updateState]);

  /**
   * Actualizar trabajo existente
   */
  const updateWork = useCallback(async (workId: string, workData: Partial<IWork>) => {
    try {
      updateState({ isLoading: true });
      
      console.log(`Updating work ${workId} of type ${workType}:`, workData);
      
      await workService.updateWork(workId, workData);
      
      // Recargar lista de trabajos
      await loadWorks();
      
      updateState({ 
        isLoading: false,
        isDialogOpen: false,
        selectedWork: null,
      });
      
      toast({
        title: "Éxito",
        description: "Trabajo actualizado exitosamente",
      });
      
    } catch (error) {
      console.error(`Error updating work ${workId} of type ${workType}:`, error);
      updateState({ isLoading: false });
      toast({
        title: "Error",
        description: "Error al actualizar el trabajo",
        variant: "destructive",
      });
      throw error;
    }
  }, [workType, loadWorks, updateState]);

  /**
   * Eliminar trabajo (usando changeWorkState como soft delete)
   */
  const deleteWork = useCallback(async (workId: string) => {
    try {
      updateState({ isLoading: true });
      
      console.log(`Soft deleting work ${workId} of type ${workType}`);
      
      // Use changeWorkState to void the work (soft delete)
      await workService.changeWorkState(workId, 'void');
      
      // Recargar lista de trabajos
      await loadWorks();
      
      updateState({ 
        isLoading: false,
        selectedWork: null,
      });
      
      toast({
        title: "Éxito",
        description: "Trabajo marcado como anulado exitosamente",
      });
      
    } catch (error) {
      console.error(`Error deleting work ${workId} of type ${workType}:`, error);
      updateState({ isLoading: false });
      toast({
        title: "Error",
        description: "Error al anular el trabajo",
        variant: "destructive",
      });
      throw error;
    }
  }, [workType, loadWorks, updateState]);

  // Efectos
  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  useEffect(() => {
    if (!isLoadingMasterData) {
      loadWorks();
    }
  }, [loadWorks, isLoadingMasterData]);

  return {
    // Estado
    state,
    masterData,
    isLoadingMasterData,
    
    // Acciones de estado
    updateState,
    selectWork,
    
    // Acciones CRUD
    createWork,
    updateWork,
    deleteWork,
    
    // Acciones de carga
    loadWorks,
    loadWorkEntities,
    refreshData: () => {
      loadMasterData();
      loadWorks();
    },
  };
};