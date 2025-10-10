import { ENDPOINTS } from '@/lib/constants';
import { IPlaguePerPostharvestZone } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing plague per postharvest zone data
 */
class PlaguePerPostharvestZoneService {
  /**
   * Get all plague per postharvest zone records
   * @returns Promise with all plague per postharvest zone records
   */
  async findAll(): Promise<IPlaguePerPostharvestZone[] | { data: IPlaguePerPostharvestZone[] }> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.plaguePerPostharvestZone.base), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching plague per postharvest zone records:', error);
      throw error;
    }
  }

  /**
   * Create a new plague per postharvest zone record
   * @param plaguePerPostharvestZone Plague per postharvest zone data
   * @returns Promise with created plague per postharvest zone record
   */
  async createPlaguePerPostharvestZone(plaguePerPostharvestZone: Partial<IPlaguePerPostharvestZone>): Promise<IPlaguePerPostharvestZone> {
    try {
      const plaguePerPostharvestZoneData: Partial<IPlaguePerPostharvestZone> = {
        grainsInstalled: plaguePerPostharvestZone.grainsInstalled,
        grainsFound: plaguePerPostharvestZone.grainsFound,
        justification: plaguePerPostharvestZone.justification,
        isHarvestSeason: plaguePerPostharvestZone.isHarvestSeason,
        reviewer: plaguePerPostharvestZone.reviewer,
        date: plaguePerPostharvestZone.date,
        checks: plaguePerPostharvestZone.checks,
        state: plaguePerPostharvestZone.state !== undefined ? plaguePerPostharvestZone.state : true,
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.plaguePerPostharvestZone.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(plaguePerPostharvestZoneData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating plague per postharvest zone record:', error);
      throw error;
    }
  }

  /**
   * Update an existing plague per postharvest zone record
   * @param id Plague per postharvest zone ID
   * @param plaguePerPostharvestZone Updated plague per postharvest zone data
   * @returns Promise with updated plague per postharvest zone record
   */
  async updatePlaguePerPostharvestZone(id: string | number, plaguePerPostharvestZone: Partial<IPlaguePerPostharvestZone>): Promise<IPlaguePerPostharvestZone> {
    try {
      const response = await fetch(ENDPOINTS.plaguePerPostharvestZone.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(plaguePerPostharvestZone),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating plague per postharvest zone ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a plague per postharvest zone record by setting its state to inactive
   * @param id Plague per postharvest zone ID
   * @returns Promise with operation result
   */
  async softDeletePlaguePerPostharvestZone(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.plaguePerPostharvestZone.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting plague per postharvest zone ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single plague per postharvest zone record by ID
   * @param id Plague per postharvest zone ID
   * @returns Promise with plague per postharvest zone data
   */
  async findById(id: string | number): Promise<IPlaguePerPostharvestZone> {
    try {
      const response = await fetch(ENDPOINTS.plaguePerPostharvestZone.byId(id), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching plague per postharvest zone ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const plaguePerPostharvestZoneService = new PlaguePerPostharvestZoneService();

export default plaguePerPostharvestZoneService;
