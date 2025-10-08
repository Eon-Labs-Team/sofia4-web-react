import { ENDPOINTS } from '@/lib/constants';
import { IHygieneSanitation } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing hygiene and sanitation data
 */
class HygieneSanitationService {
  /**
   * Get all hygiene and sanitation records
   * @returns Promise with all records
   */
  async findAll(): Promise<IHygieneSanitation[]> {
    try {
      const response = await fetch(ENDPOINTS.hygieneSanitation.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching hygiene and sanitation records:', error);
      throw error;
    }
  }

  /**
   * Create a new hygiene and sanitation record
   * @param hygieneSanitation Record data
   * @returns Promise with created record
   */
  async createHygieneSanitation(hygieneSanitation: Partial<IHygieneSanitation>): Promise<IHygieneSanitation> {
    try {
      const hygieneSanitationData: Partial<IHygieneSanitation> = {
        type: hygieneSanitation.type,
        startPeriod: hygieneSanitation.startPeriod,
        endPeriod: hygieneSanitation.endPeriod,
        titleForField1: hygieneSanitation.titleForField1,
        titleForField2: hygieneSanitation.titleForField2,
        field3To20: hygieneSanitation.field3To20,
        user: hygieneSanitation.user,
        state: hygieneSanitation.state !== undefined ? hygieneSanitation.state : true,
      };

      const response = await fetch(ENDPOINTS.hygieneSanitation.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(hygieneSanitationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating hygiene and sanitation record:', error);
      throw error;
    }
  }

  /**
   * Update an existing hygiene and sanitation record
   * @param id Record ID
   * @param hygieneSanitation Updated record data
   * @returns Promise with updated record
   */
  async updateHygieneSanitation(id: string | number, hygieneSanitation: Partial<IHygieneSanitation>): Promise<IHygieneSanitation> {
    try {
      const response = await fetch(ENDPOINTS.hygieneSanitation.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(hygieneSanitation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating hygiene and sanitation record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a hygiene and sanitation record by setting its state to inactive
   * @param id Record ID
   * @returns Promise with operation result
   */
  async softDeleteHygieneSanitation(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.hygieneSanitation.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting hygiene and sanitation record ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single hygiene and sanitation record by ID
   * @param id Record ID
   * @returns Promise with record data
   */
  async findById(id: string | number): Promise<IHygieneSanitation> {
    try {
      const response = await fetch(ENDPOINTS.hygieneSanitation.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching hygiene and sanitation record ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const hygieneSanitationService = new HygieneSanitationService();

export default hygieneSanitationService; 