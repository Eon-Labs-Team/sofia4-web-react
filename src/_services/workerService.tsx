import { ENDPOINTS } from '@/lib/constants';
import { IWorkers } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing workers (trabajos realizados) data
 */
class WorkerService {
  /**
   * Get all workers
   * @returns Promise with all workers
   */
  async findAll(propertyId?: string | number | null): Promise<IWorkers[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.workers.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.workers.base}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workers:', error);
      throw error;
    }
  }

  /**
   * Create a new worker
   * @param worker Worker data
   * @returns Promise with created worker
   */
  async createWorker(worker: Partial<any>, propertyId?: string | number | null): Promise<IWorkers> {
    try {
      const workerData: Partial<any> = {
        ...worker,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: worker.state !== undefined ? worker.state : true
      };

      console.log(workerData);
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerData.propertyId = propertyId;
      }


      const response = await fetch(ENDPOINTS.workers.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(workerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating worker:', error);
      throw error;
    }
  }

  /**
   * Update an existing worker
   * @param id Worker ID
   * @param worker Updated worker data
   * @returns Promise with updated worker
   */
  async updateWorker(id: string | number, worker: Partial<IWorkers>): Promise<IWorkers> {
    try {
      const workerData = { ...worker};
      // @ts-ignore
      delete workerData.__v;
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.workers.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(workerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating worker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a worker by setting its state to inactive
   * @param id Worker ID
   * @returns Promise with operation result
   */
  async softDeleteWorker(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.workers.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting worker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single worker by ID
   * @param id Worker ID
   * @returns Promise with worker data
   */
  async findById(id: string | number): Promise<IWorkers> {
    try {
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.workers.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching worker ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const workerService = new WorkerService();

export default workerService; 