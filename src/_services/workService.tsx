import { ENDPOINTS } from '@/lib/constants';
import { IWork } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing Work (Orden de aplicación) data
 */
class WorkService {
  /**
   * Get all works with type A (Orden de aplicación)
   * @returns Promise with all orden de aplicación
   */
  async findAll(propertyId?: string | number | null): Promise<IWork[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${`${ENDPOINTS.work?.base}`}?propertyId=${propertyId}`
        : `${`${ENDPOINTS.work?.base}`}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
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
  async createApplication(work: Partial<IWork>, propertyId?: string | number | null): Promise<IWork> {
    try {
      const workData: Partial<IWork> = {
        ...work,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: work.state !== undefined ? work.state : true
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workData.propertyId = propertyId;
      }

      console.log('Sending to API:', JSON.stringify(workData));

      const response = await fetch(ENDPOINTS.work?.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
   * Create a new work with type A t (tRABAJO AGRICOLA)
   * @param work Work data
   * @returns Promise with created work
   */
  async createAgriculturalWork(work: Partial<IWork>, propertyId?: string | number | null): Promise<IWork> {
    try {
      const workData: Partial<IWork> = {
        ...work,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: work.state !== undefined ? work.state : true
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        workData.propertyId = propertyId;
      }

      console.log('Sending to API:', JSON.stringify(workData));

      const response = await fetch(ENDPOINTS.work?.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
      const user = authService.getCurrentUser();
      
      const workData = { 
        ...work,
        updatedBy: user?.id || null, // Add updatedBy field with current user ID
      };
      
      console.log('Updating with data:', JSON.stringify(workData));

      const response = await fetch(ENDPOINTS.work?.byId(id), {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(workData),
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
      const user = authService.getCurrentUser();
      
      const stateData = { 
        workState: state,
        updatedBy: user?.id || null, // Add updatedBy field with current user ID
      };
      
      const response = await fetch(ENDPOINTS.work?.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData),
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
        headers: authService.getAuthHeaders(),
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