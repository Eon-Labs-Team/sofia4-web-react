import { ENDPOINTS } from '@/lib/constants';
import { IMachinery } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing machinery data
 */
class MachineryService {
  /**
   * Get all machinery
   * @returns Promise with all machinery
   */
  async findAll(): Promise<IMachinery[]> {
    try {
      
      const url = authService.buildUrlWithParams(ENDPOINTS.machinery.base);

      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching machinery:', error);
      throw error;
    }
  }

  /**
   * Create a new machinery record
   * @param machinery Machinery data
   * @returns Promise with created machinery
   */
  async createMachinery(machinery: Partial<IMachinery>): Promise<IMachinery> {
    try {
      const machineryData: Partial<IMachinery> = {
        ...machinery,
//        state: machinery.state !== undefined ? machinery.state : true
      };

      console.log(machineryData);

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.machinery.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const machineryResponse = await response.json();
      return machineryResponse.data || machineryResponse;

    } catch (error) {
      console.error('Error creating machinery:', error);
      throw error;
    }
  }

  /**
   * Update an existing machinery record
   * @param id Machinery ID
   * @param machinery Updated machinery data
   * @returns Promise with updated machinery
   */
  async updateMachinery(id: string | number, machinery: Partial<IMachinery>): Promise<IMachinery> {
    try {
      const machineryData = { ...machinery };      
      
      // Remove version field if it exists
      if ('__v' in machineryData) {
        delete (machineryData as any).__v;
      }

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.machinery.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a machinery record by setting its state to inactive
   * @param id Machinery ID
   * @returns Promise with operation result
   */
  async softDeleteMachinery(id: string | number): Promise<any> {
    try {
      const stateData: any = { state: false };      
      
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.machinery.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single machinery record by ID
   * @param id Machinery ID
   * @returns Promise with machinery data
   */
  async findById(id: string | number): Promise<IMachinery> {
    try {
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.machinery.byId(id));      
      
      const response = await fetch(authService.buildUrlWithParams(url.toString()), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const machineryService = new MachineryService();

export default machineryService; 