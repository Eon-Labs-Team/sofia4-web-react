import { ENDPOINTS } from '@/lib/constants';
import { ISafetyClearance } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing safety clearance data
 */
class SafetyClearanceService {
  /**
   * Get all safety clearance records
   * @returns Promise with all safety clearance records
   */
  async findAll(): Promise<ISafetyClearance[] | { data: ISafetyClearance[] }> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.safetyClearance.base), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching safety clearance records:', error);
      throw error;
    }
  }

  /**
   * Create a new safety clearance record
   * @param safetyClearance Safety clearance data
   * @returns Promise with created safety clearance record
   */
  async createSafetyClearance(safetyClearance: Partial<ISafetyClearance>): Promise<ISafetyClearance> {
    try {
      const safetyClearanceData: Partial<ISafetyClearance> = {
        code: safetyClearance.code,
        area: safetyClearance.area,
        companyName: safetyClearance.companyName,
        from: safetyClearance.from,
        to: safetyClearance.to,
        startDate: safetyClearance.startDate,
        checks: safetyClearance.checks,
        responsibleSignature: safetyClearance.responsibleSignature,
        superiorSignature: safetyClearance.superiorSignature,
        reviewer: safetyClearance.reviewer,
        image1: safetyClearance.image1,
        image2: safetyClearance.image2,
        image3: safetyClearance.image3,
        observation: safetyClearance.observation,
        state: safetyClearance.state !== undefined ? safetyClearance.state : true,
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.safetyClearance.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(safetyClearanceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating safety clearance record:', error);
      throw error;
    }
  }

  /**
   * Update an existing safety clearance record
   * @param id Safety clearance ID
   * @param safetyClearance Updated safety clearance data
   * @returns Promise with updated safety clearance record
   */
  async updateSafetyClearance(id: string | number, safetyClearance: Partial<ISafetyClearance>): Promise<ISafetyClearance> {
    try {
      const response = await fetch(ENDPOINTS.safetyClearance.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(safetyClearance),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating safety clearance ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a safety clearance record by setting its state to inactive
   * @param id Safety clearance ID
   * @returns Promise with operation result
   */
  async softDeleteSafetyClearance(id: string | number): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.safetyClearance.changeState(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting safety clearance ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single safety clearance record by ID
   * @param id Safety clearance ID
   * @returns Promise with safety clearance data
   */
  async findById(id: string | number): Promise<ISafetyClearance> {
    try {
      const response = await fetch(ENDPOINTS.safetyClearance.byId(id), {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching safety clearance ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const safetyClearanceService = new SafetyClearanceService();

export default safetyClearanceService;
