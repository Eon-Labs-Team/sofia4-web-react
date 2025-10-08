import { ENDPOINTS } from '@/lib/constants';
import { ICostClassification } from "@eon-lib/eon-mongoose/types";
import authService from './authService';

/**
 * Service for managing cost classification data
 * Uses the ICostClassification interface from eon-mongoose
 */
class CostClassificationService {
  
  /**
   * Get all cost classifications
   * @returns Promise with all cost classifications
   */
  async findAll(): Promise<ICostClassification[]> {
    try {
      const response = await fetch(ENDPOINTS.costClassification.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching cost classifications:', error);
      throw error;
    }
  }

  /**
   * Create a new cost classification
   * @param costClassification Cost classification data
   * @returns Promise with created cost classification
   */
  async create(costClassification: Partial<ICostClassification>): Promise<ICostClassification> {
    try {
      const costClassificationData: Partial<ICostClassification> = {
        ...costClassification,
        state: costClassification.state !== undefined ? costClassification.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.costClassification.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(costClassificationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating cost classification:', error);
      throw error;
    }
  }

  /**
   * Update an existing cost classification
   * @param id Cost classification ID
   * @param costClassification Updated cost classification data
   * @returns Promise with updated cost classification
   */
  async update(id: string | number, costClassification: Partial<ICostClassification>): Promise<ICostClassification> {
    try {
      const costClassificationData = { 
        ...costClassification,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.costClassification.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(costClassificationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating cost classification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a cost classification by setting its state to inactive
   * @param id Cost classification ID
   * @returns Promise with operation result
   */
  async softDelete(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.costClassification.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting cost classification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single cost classification by ID
   * @param id Cost classification ID
   * @returns Promise with cost classification data
   */
  async findById(id: string | number): Promise<ICostClassification> {
    try {
      const response = await fetch(ENDPOINTS.costClassification.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching cost classification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a cost classification
   * @param id Cost classification ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.costClassification.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for cost classification ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const costClassificationService = new CostClassificationService();

export default costClassificationService;