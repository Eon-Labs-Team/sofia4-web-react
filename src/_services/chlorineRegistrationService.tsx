import { ENDPOINTS } from '@/lib/constants';
import { IChlorineRegistration } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

interface APIResponse<T> {
  data: T[];
  [key: string]: any;
}

/**
 * Service for managing chlorine registration data
 */
class ChlorineRegistrationService {
  /**
   * Get all chlorine registrations
   * @returns Promise with all chlorine registrations
   */
  async findAll(): Promise<APIResponse<IChlorineRegistration> | IChlorineRegistration[]> {
    try {
      const response = await fetch(ENDPOINTS.chlorineRegistration.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chlorine registrations:', error);
      throw error;
    }
  }

  /**
   * Create a new chlorine registration
   * @param chlorineRegistration ChlorineRegistration data
   * @returns Promise with created chlorine registration
   */
  async createChlorineRegistration(chlorineRegistration: Partial<IChlorineRegistration>): Promise<IChlorineRegistration> {
    try {
      const chlorineRegistrationData: Partial<IChlorineRegistration> = {
        code: chlorineRegistration.code,
        area: chlorineRegistration.area,
        plotLot: chlorineRegistration.plotLot,
        frequency: chlorineRegistration.frequency,
        supervisor: chlorineRegistration.supervisor,
        observations: chlorineRegistration.observations,
        reviewer: chlorineRegistration.reviewer,
        state: chlorineRegistration.state !== undefined ? chlorineRegistration.state : true,
      };

      const response = await fetch(ENDPOINTS.chlorineRegistration.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(chlorineRegistrationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chlorine registration:', error);
      throw error;
    }
  }

  /**
   * Update an existing chlorine registration
   * @param id ChlorineRegistration ID
   * @param chlorineRegistration Updated chlorine registration data
   * @returns Promise with updated chlorine registration
   */
  async updateChlorineRegistration(id: string | number, chlorineRegistration: Partial<IChlorineRegistration>): Promise<IChlorineRegistration> {
    try {
      const response = await fetch(ENDPOINTS.chlorineRegistration.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(chlorineRegistration),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating chlorine registration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a chlorine registration by setting its state to inactive
   * @param id ChlorineRegistration ID
   * @returns Promise with operation result
   */
  async softDeleteChlorineRegistration(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.chlorineRegistration.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting chlorine registration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single chlorine registration by ID
   * @param id ChlorineRegistration ID
   * @returns Promise with chlorine registration data
   */
  async findById(id: string | number): Promise<IChlorineRegistration> {
    try {
      const response = await fetch(ENDPOINTS.chlorineRegistration.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching chlorine registration ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const chlorineRegistrationService = new ChlorineRegistrationService();

export default chlorineRegistrationService; 