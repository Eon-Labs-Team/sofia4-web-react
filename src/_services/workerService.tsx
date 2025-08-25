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
  async findAll(): Promise<IWorkers[]> {
    try {
      const url = authService.buildUrlWithParams(ENDPOINTS.workers.base);
      
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
  async createWorker(worker: Partial<any>): Promise<IWorkers> {
    try {
      const workerData: Partial<any> = {
        ...worker,
        state: worker.state !== undefined ? worker.state : true
      };

      console.log(workerData);

      const url = authService.buildUrlWithParams(ENDPOINTS.workers.base);
      const response = await fetch(url, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(workerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const workersResponse = await response.json();
      return workersResponse.data || workersResponse;

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
      
      const url = authService.buildUrlWithParams(ENDPOINTS.workers.byId(id));
      const response = await fetch(url, {
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
      
      const url = authService.buildUrlWithParams(ENDPOINTS.workers.byId(id));
      const response = await fetch(url, {
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
      const url = authService.buildUrlWithParams(ENDPOINTS.workers.byId(id));
      
      const response = await fetch(url, {
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