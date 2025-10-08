import { ENDPOINTS } from '@/lib/constants';
import { IPersonnelProvision } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing personnel provision data
 */
class PersonnelProvisionService {
  /**
   * Get all personnel provisions for a specific property
   * @param propertyId The ID of the property to get personnel provisions for
   * @returns Promise with personnel provisions for the property
   */
  async findAll(propertyId?: string | number | null): Promise<IPersonnelProvision[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.personnelProvision.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.personnelProvision.base}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching personnel provisions:', error);
      throw error;
    }
  }

  /**
   * Create a new personnel provision
   * @param personnelProvision Personnel provision data
   * @param propertyId The ID of the property this personnel provision belongs to
   * @returns Promise with created personnel provision
   */
  async createPersonnelProvision(personnelProvision: Partial<IPersonnelProvision>, propertyId?: string | number | null): Promise<IPersonnelProvision> {
    try {
      const personnelProvisionData: Partial<IPersonnelProvision> = {
        ...personnelProvision,
        // @ts-ignore
        propertyId, // Add propertyId to the personnel provision data
        state: personnelProvision.state !== undefined ? personnelProvision.state : true
      };

      const response = await fetch(ENDPOINTS.personnelProvision.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(personnelProvisionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating personnel provision:', error);
      throw error;
    }
  }

  /**
   * Update an existing personnel provision
   * @param id Personnel provision ID
   * @param personnelProvision Updated personnel provision data
   * @returns Promise with updated personnel provision
   */
  async updatePersonnelProvision(id: string | number, personnelProvision: Partial<IPersonnelProvision>): Promise<IPersonnelProvision> {
    try {
      const response = await fetch(ENDPOINTS.personnelProvision.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(personnelProvision),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating personnel provision ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a personnel provision by setting its state to inactive
   * @param id Personnel provision ID
   * @returns Promise with operation result
   */
  async softDeletePersonnelProvision(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.personnelProvision.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting personnel provision ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single personnel provision by ID
   * @param id Personnel provision ID
   * @returns Promise with personnel provision data
   */
  async findById(id: string | number): Promise<IPersonnelProvision> {
    try {
      const response = await fetch(ENDPOINTS.personnelProvision.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching personnel provision ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const personnelProvisionService = new PersonnelProvisionService();

export default personnelProvisionService; 