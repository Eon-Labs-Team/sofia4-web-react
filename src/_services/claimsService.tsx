import { ENDPOINTS } from '@/lib/constants';
import { IClaims } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing claims data
 */
class ClaimsService {
  /**
   * Get all claims records
   * @returns Promise with all claims records
   */
  async findAll(): Promise<IClaims[] | { data: IClaims[] }> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.claims.base), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching claims records:', error);
      throw error;
    }
  }

  /**
   * Create a new claims record
   * @param claims Claims data
   * @returns Promise with created claims record
   */
  async createClaims(claims: Partial<IClaims>): Promise<IClaims> {
    try {
      const claimsData: Partial<IClaims> = {
        date: claims.date,
        claimType: claims.claimType,
        description: claims.description,
        claimant: claims.claimant,
        responsible: claims.responsible,
        status: claims.status,
        resolution: claims.resolution,
        resolutionDate: claims.resolutionDate,
        state: claims.state !== undefined ? claims.state : true,
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.claims.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(claimsData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating claims record:', error);
      throw error;
    }
  }

  /**
   * Update an existing claims record
   * @param id Claims ID
   * @param claims Updated claims data
   * @returns Promise with updated claims record
   */
  async updateClaims(id: string | number, claims: Partial<IClaims>): Promise<IClaims> {
    try {
      const response = await fetch(ENDPOINTS.claims.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(claims),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating claims ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a claims record by setting its state to inactive
   * @param id Claims ID
   * @returns Promise with operation result
   */
  async softDeleteClaims(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.claims.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting claims ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single claims record by ID
   * @param id Claims ID
   * @returns Promise with claims data
   */
  async findById(id: string | number): Promise<IClaims> {
    try {
      const response = await fetch(ENDPOINTS.claims.byId(id), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching claims ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const claimsService = new ClaimsService();

export default claimsService;
