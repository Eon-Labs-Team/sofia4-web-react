import { ENDPOINTS } from '@/lib/constants';
import { IAnimalAdmission } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing animal admission data
 */
class AnimalAdmissionService {
  /**
   * Get all animal admissions for a specific property
   * @param propertyId The ID of the property to get animal admissions for
   * @returns Promise with animal admissions for the property
   */

  async findAll(propertyId?: string | number | null): Promise<IAnimalAdmission[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.animalAdmission.base}?propertyId=${propertyId}`
        : `${ENDPOINTS.animalAdmission.base}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching animal admissions:', error);
      throw error;
    }
  }

  /**
   * Create a new animal admission
   * @param animalAdmission Animal admission data
   * @param propertyId The ID of the property this animal admission belongs to
   * @returns Promise with created animal admission
   */
  async createAnimalAdmission(animalAdmission: Partial<IAnimalAdmission>, propertyId?: string | number | null): Promise<IAnimalAdmission> {
    try {
      const animalAdmissionData: Partial<IAnimalAdmission> = {
        ...animalAdmission,
        // @ts-ignore
        propertyId, // Add propertyId to the animal admission data
        state: animalAdmission.state !== undefined ? animalAdmission.state : true
      };

      const response = await fetch(`${ENDPOINTS.animalAdmission.base}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(animalAdmissionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating animal admission:', error);
      throw error;
    }
  }

  /**
   * Update an existing animal admission
   * @param id Animal admission ID
   * @param animalAdmission Updated animal admission data
   * @returns Promise with updated animal admission
   */
  async updateAnimalAdmission(id: string | number, animalAdmission: Partial<IAnimalAdmission>): Promise<IAnimalAdmission> {
    try {
      const response = await fetch(`${ENDPOINTS.animalAdmission.byId(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(animalAdmission),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating animal admission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an animal admission by setting its state to inactive
   * @param id Animal admission ID
   * @returns Promise with operation result
   */
  async softDeleteAnimalAdmission(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.animalAdmission.changeState(id)}`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting animal admission ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const animalAdmissionService = new AnimalAdmissionService();

export default animalAdmissionService; 