import { ENDPOINTS } from '@/lib/constants';
import { ICostSubclassification } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing cost subclassification data
 * Uses the ICostSubclassification interface from eon-mongoose
 */
class CostSubclassificationService {
  
  /**
   * Get all cost subclassifications
   * @returns Promise with all cost subclassifications
   */
  async findAll(): Promise<ICostSubclassification[]> {
    try {
      const response = await fetch(ENDPOINTS.costSubclassification.base, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching cost subclassifications:', error);
      throw error;
    }
  }

  /**
   * Create a new cost subclassification
   * @param costSubclassification Cost subclassification data
   * @returns Promise with created cost subclassification
   */
  async create(costSubclassification: Partial<ICostSubclassification>): Promise<ICostSubclassification> {
    try {
      const costSubclassificationData: Partial<ICostSubclassification> = {
        ...costSubclassification,
        state: costSubclassification.state !== undefined ? costSubclassification.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.costSubclassification.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(costSubclassificationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating cost subclassification:', error);
      throw error;
    }
  }

  /**
   * Update an existing cost subclassification
   * @param id Cost subclassification ID
   * @param costSubclassification Updated cost subclassification data
   * @returns Promise with updated cost subclassification
   */
  async update(id: string | number, costSubclassification: Partial<ICostSubclassification>): Promise<ICostSubclassification> {
    try {
      const costSubclassificationData = { 
        ...costSubclassification,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.costSubclassification.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(costSubclassificationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating cost subclassification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a cost subclassification by setting its state to inactive
   * @param id Cost subclassification ID
   * @returns Promise with operation result
   */
  async softDelete(id: string | number): Promise<any> {
    try {
      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.costSubclassification.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting cost subclassification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single cost subclassification by ID
   * @param id Cost subclassification ID
   * @returns Promise with cost subclassification data
   */
  async findById(id: string | number): Promise<ICostSubclassification> {
    try {
      const response = await fetch(ENDPOINTS.costSubclassification.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching cost subclassification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate/deactivate a cost subclassification
   * @param id Cost subclassification ID
   * @param state New state (true = active, false = inactive)
   * @returns Promise with operation result
   */
  async setState(id: string | number, state: boolean): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.costSubclassification.setState(id, state), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error setting state for cost subclassification ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const costSubclassificationService = new CostSubclassificationService();

export default costSubclassificationService;