import { ENDPOINTS } from '@/lib/constants';
import { IWasteRemoval } from '@eon-lib/eon-mongoose';

/**
 * Service for managing waste removal data
 */
class WasteRemovalService {
  /**
   * Get all waste removals
   * @returns Promise with all waste removals
   */
  async findAll(): Promise<IWasteRemoval[]> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteRemoval.base}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching waste removals:', error);
      throw error;
    }
  }

  /**
   * Create a new waste removal
   * @param wasteRemoval Waste removal data
   * @returns Promise with created waste removal
   */
  async createWasteRemoval(wasteRemoval: Partial<IWasteRemoval>): Promise<IWasteRemoval> {
    try {
      const wasteRemovalData: Partial<IWasteRemoval> = {
        date: wasteRemoval.date,
        site: wasteRemoval.site,
        supervisor: wasteRemoval.supervisor,
        residueType: wasteRemoval.residueType,
        classification: wasteRemoval.classification,
        quantity: wasteRemoval.quantity,
        dispatchGuide: wasteRemoval.dispatchGuide,
        moveTo: wasteRemoval.moveTo,
        responsible: wasteRemoval.responsible,
        state: wasteRemoval.state !== undefined ? wasteRemoval.state : true
      };

      const response = await fetch(`${ENDPOINTS.wasteRemoval.base}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wasteRemovalData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating waste removal:', error);
      throw error;
    }
  }

  /**
   * Update an existing waste removal
   * @param id Waste removal ID
   * @param wasteRemoval Updated waste removal data
   * @returns Promise with updated waste removal
   */
  async updateWasteRemoval(id: string | number, wasteRemoval: Partial<IWasteRemoval>): Promise<IWasteRemoval> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteRemoval.byId(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wasteRemoval),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating waste removal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a waste removal by setting its state to inactive
   * @param id Waste removal ID
   * @returns Promise with operation result
   */
  async softDeleteWasteRemoval(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteRemoval.changeState(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting waste removal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single waste removal by ID
   * @param id Waste removal ID
   * @returns Promise with waste removal data
   */
  async findById(id: string | number): Promise<IWasteRemoval> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteRemoval.byId(id)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching waste removal ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const wasteRemovalService = new WasteRemovalService();

export default wasteRemovalService; 