import { ENDPOINTS } from '@/lib/constants';
import { IWorkers } from '@/types/IWorkers';

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
      const response = await fetch(ENDPOINTS.workers.base, {
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
  async createWorker(worker: Partial<IWorkers>): Promise<IWorkers> {
    try {
      const workerData: Partial<IWorkers> = {
        classification: worker.classification,
        worker: worker.worker,
        quadrille: worker.quadrille,
        workingDay: worker.workingDay,
        paymentMethod: worker.paymentMethod,
        totalHectares: worker.totalHectares,
        overtime: worker.overtime,
        bond: worker.bond,
        dayValue: worker.dayValue,
        totalDeal: worker.totalDeal,
        bonuses: worker.bonuses,
        exportPerformance: worker.exportPerformance,
        juicePerformance: worker.juicePerformance,
        othersPerformance: worker.othersPerformance,
        dailyTotal: worker.dailyTotal,
        value: worker.value,
        salary: worker.salary,
        date: worker.date,
        contractor: worker.contractor,
        state: worker.state !== undefined ? worker.state : true,
      };

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
      const response = await fetch(ENDPOINTS.workers.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(worker),
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
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.workers.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: false }),
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
      const response = await fetch(ENDPOINTS.workers.byId(id), {
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