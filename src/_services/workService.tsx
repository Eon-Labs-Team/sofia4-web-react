import { ENDPOINTS } from '@/lib/constants';
import { IWork } from '@/types/IWork';

/**
 * Service for managing Work (Orden de aplicación) data
 */
class WorkService {
  /**
   * Get all works with type A (Orden de aplicación)
   * @returns Promise with all orden de aplicación
   */
  async findAll(): Promise<IWork[]> {
    try {
      const response = await fetch(`${ENDPOINTS.work?.base}?workType=A`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orden de aplicación:', error);
      throw error;
    }
  }

  /**
   * Create a new work with type A (Orden de aplicación)
   * @param work Work data
   * @returns Promise with created work
   */
  async createApplication(work: Partial<IWork>): Promise<IWork> {
    try {
      // Always set workType to 'A' for orden de aplicación
      const workData = {
        ...work,
        workType: 'A' as const,
      };

      const response = await fetch(ENDPOINTS.work?.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating orden de aplicación:', error);
      throw error;
    }
  }

  /**
   * Update an existing work
   * @param id Work ID
   * @param work Updated work data
   * @returns Promise with updated work
   */
  async updateWork(id: string | number, work: Partial<IWork>): Promise<IWork> {
    try {
      const response = await fetch(ENDPOINTS.work?.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(work),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating orden de aplicación ${id}:`, error);
      throw error;
    }
  }

  /**
   * Change work state
   * @param id Work ID
   * @param state New state value
   * @returns Promise with operation result
   */
  async changeWorkState(id: string | number, state: string): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.work?.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workState: state }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error changing orden de aplicación state ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single work by ID
   * @param id Work ID
   * @returns Promise with work data
   */
  async findById(id: string | number): Promise<IWork> {
    try {
      const response = await fetch(ENDPOINTS.work?.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching orden de aplicación ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const workService = new WorkService();

export default workService; 