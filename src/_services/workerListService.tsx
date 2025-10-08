import { ENDPOINTS } from '@/lib/constants';
import { IWorkerList } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing worker list data
 */
class WorkerListService {
  /**
   * Get all worker list
   * @returns Promise with all worker list
   */
  async findAll(propertyId?: string | number | null): Promise<IWorkerList[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      // const url = propertyId 
      //   ? `${ENDPOINTS.workerList.base}?propertyId=${propertyId}`
      //   : `${ENDPOINTS.workerList.base}`;

      const url = authService.buildUrlWithParams(ENDPOINTS.workerList.base);
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const workerData = await response.json();
      return workerData.data || workerData;
    } catch (error) {
      console.error('Error fetching worker list:', error);
      throw error;
    }
  }

  /**
   * Create a new worker list entry
   * @param workerList IWorkerList data
   * @returns Promise with created worker list
   */
  async createWorkerList(workerList: Partial<IWorkerList>, propertyId?: string | number | null): Promise<IWorkerList> {
    try {
      const workerListData: Partial<IWorkerList> = {
        ...workerList,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: workerList.state !== undefined ? workerList.state : true
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerListData.propertyId = propertyId;
      }
      const url = authService.buildUrlWithParams(ENDPOINTS.workerList.base);

      console.log("workerlistData to insert in service", workerListData);

      const response = await fetch(url, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(workerListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating worker list:', error);
      throw error;
    }
  }

  /**
   * Update an existing worker list entry
   * @param id WorkerList ID
   * @param workerList Updated worker list data
   * @returns Promise with updated worker list
   */
  async updateWorkerList(id: string | number, workerList: Partial<IWorkerList>): Promise<IWorkerList> {
    try {
      // Get propertyId first
      const propertyId = authService.getPropertyId();
      const url = authService.buildUrlWithParams(ENDPOINTS.workerList.byId(id));
      // Apply fallbacks for required fields if they are being updated
      const updateData: Partial<IWorkerList> = {
        ...workerList,
        // Apply fallbacks only if the fields are present in the update
        ...(workerList.rutDniNationality !== undefined && { rutDniNationality: workerList.rutDniNationality || 'CL' }),
        ...(workerList.rut !== undefined && { rut: workerList.rut || '00000000-0' }),
        ...(workerList.names !== undefined && { names: workerList.names || 'No especificado' }),
        ...(workerList.lastName !== undefined && { lastName: workerList.lastName || 'No especificado' }),
        ...(workerList.secondLastName !== undefined && { secondLastName: workerList.secondLastName || 'No especificado' }),
        ...(workerList.sex !== undefined && { sex: workerList.sex || 'No especificado' }),
        ...(workerList.property !== undefined && { property: workerList.property || propertyId?.toString() || '1' }),
        ...(workerList.startDate !== undefined && { startDate: workerList.startDate || new Date().toISOString().split('T')[0] }),
        ...(workerList.provision !== undefined && { provision: workerList.provision || 'No especificado' }),
        ...(workerList.socialSecurity !== undefined && { socialSecurity: workerList.socialSecurity || 'No especificado' }),
        // Handle provisionalRegime separately as it's boolean
        ...(workerList.provisionalRegime !== undefined && { provisionalRegime: workerList.provisionalRegime })
      };
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        updateData.propertyId = propertyId;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating worker list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a worker list entry
   * @param id WorkerList ID
   * @returns Promise with deleted worker list
   */
  async softDeleteWorkerList(id: string | number): Promise<IWorkerList> {
    try {
      const url = authService.buildUrlWithParams(ENDPOINTS.workerList.changeState(id, false));


      const response = await fetch(url, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting worker list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single worker list entry by ID
   * @param id WorkerList ID
   * @returns Promise with worker list data
   */
  async findById(id: string | number): Promise<IWorkerList> {
    try {
      const response = await fetch(ENDPOINTS.workerList.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching worker list ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const workerListService = new WorkerListService();

export default workerListService; 