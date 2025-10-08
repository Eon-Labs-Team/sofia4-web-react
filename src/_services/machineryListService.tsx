import { ENDPOINTS } from '@/lib/constants';
import { IMachineryList } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing lista maquinarias (machinery list) data
 */
class ListaMaquinariasService {
  /**
   * Get all machinery list
   * @returns Promise with all machinery list
   */
  async findAll(propertyId?: string | number | null): Promise<IMachineryList[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = authService.buildUrlWithParams(ENDPOINTS.machineryList.base)
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const machineryData = await response.json();
      return machineryData.data || machineryData;
    } catch (error) {
      console.error('Error fetching machinery list:', error);
      throw error;
    }
  }

  /**
   * Create a new machinery list
   * @param machineryList IMachineryList data
   * @returns Promise with created machinery list
   */
  async createMachineryList(machineryList: Partial<IMachineryList>, propertyId?: string | number | null): Promise<IMachineryList> {
    try {
      const machineryListData: Partial<IMachineryList> = {
        ...machineryList,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: machineryList.state !== undefined ? machineryList.state : true
      };
      
      // Add createdBy field with current user ID
      const currentUser = authService.getCurrentUser();
      if (currentUser?.id) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryListData.createdBy = currentUser.id;
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        machineryListData.updatedBy = currentUser.id;
      }

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.machineryList.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(machineryListData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating machinery list:', error);
      throw error;
    }
  }

  /**
   * Update an existing machinery list
   * @param id IMachineryList ID
   * @param machineryList Updated machinery list data
   * @returns Promise with updated machinery list
   */
  async updateMachineryList(id: string | number, machineryList: Partial<IMachineryList>): Promise<IMachineryList> {
    try {
      const updateData = { ...machineryList };          
      
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.machineryList.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating machinery list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a machinery list by setting its state to inactive
   * @param id IMachineryList ID
   * @returns Promise with operation result
   */
  async softDeleteMachineryList(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.machineryList.changeState(id, false), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting machinery list ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single machinery list by ID
   * @param id IMachineryList ID
   * @returns Promise with machinery list data
   */
  async findById(id: string | number): Promise<IMachineryList> {
    try {
      const response = await fetch(ENDPOINTS.machineryList.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching machinery list ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const listaMaquinariasService = new ListaMaquinariasService();

export default listaMaquinariasService; 