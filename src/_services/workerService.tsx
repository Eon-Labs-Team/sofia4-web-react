import { ENDPOINTS } from '@/lib/constants';
import { IWorkers } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

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
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.workers.base);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
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
      const { propertyId, user } = useAuthStore.getState();
      
      const workerData: Partial<IWorkers> = {
        // @ts-ignore
        classification: worker.classification,
        worker: worker.worker,
        quadrille: worker.quadrille,
        workingDay: worker.workingDay,
        paymentMethod: worker.paymentMethod,
        yield: worker.yield,
        totalHoursYield: worker.totalHoursYield,
        overtime: worker.overtime,
        bonus: worker.bonus,
        // @ts-ignore
        bond: worker.bond,
        yieldValue: worker.yieldValue,
        dayValue: worker.dayValue,
        additionalBonuses: worker.additionalBonuses,
        exportPerformance: worker.exportPerformance,
        juicePerformance: worker.juicePerformance,
        othersPerformance: worker.othersPerformance,
        totalDeal: worker.totalDeal,
        dailyTotal: worker.dailyTotal,
        value: worker.value,
        salary: worker.salary,
        date: worker.date,
        contractor: worker.contractor,
        workId: worker.workId,
        state: worker.state !== undefined ? worker.state : true,
        createdBy: user?.id || null,
        updatedBy: user?.id || null,
      };

      console.log(workerData);
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workerData.propertyId = propertyId;
      }


      const response = await fetch(ENDPOINTS.workers.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const { propertyId } = useAuthStore.getState();
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const stateData = { state: false };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.workers.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.workers.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
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