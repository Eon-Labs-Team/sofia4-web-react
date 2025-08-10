import { ENDPOINTS, API_BASE_URL } from '@/lib/constants';
import { IWasteManagement } from '@eon-lib/eon-mongoose';

/**
 * Service for managing waste management data
 */
class WasteManagementService {
  /**
   * Get all waste managements
   * @returns Promise with all waste managements
   */
  async findAll(): Promise<IWasteManagement[]> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteManagement.base}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching waste managements:', error);
      throw error;
    }
  }

  /**
   * Create a new waste management
   * @param wasteManagement Waste management data
   * @returns Promise with created waste management
   */
  async createWasteManagement(wasteManagement: Partial<IWasteManagement>): Promise<IWasteManagement> {
    try {
      const wasteManagementData: Partial<IWasteManagement> = {
        deliveryDate: wasteManagement.deliveryDate,
        wasteOriginField: wasteManagement.wasteOriginField,
        wasteOrigin: wasteManagement.wasteOrigin,
        quantity: wasteManagement.quantity,
        weight: wasteManagement.weight,
        wasteHandling: wasteManagement.wasteHandling,
        wasteDestination: wasteManagement.wasteDestination,
        responsiblePerson: wasteManagement.responsiblePerson,
        appliedPerson: wasteManagement.appliedPerson,
        recommendedBy: wasteManagement.recommendedBy,
        supervisor: wasteManagement.supervisor,
        deliveredTo: wasteManagement.deliveredTo,
        wasteType: wasteManagement.wasteType,
        state: wasteManagement.state !== undefined ? wasteManagement.state : true
      };

      const response = await fetch(`${ENDPOINTS.wasteManagement.base}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wasteManagementData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating waste management:', error);
      throw error;
    }
  }

  /**
   * Update an existing waste management
   * @param id Waste management ID
   * @param wasteManagement Updated waste management data
   * @returns Promise with updated waste management
   */
  async updateWasteManagement(id: string | number, wasteManagement: Partial<IWasteManagement>): Promise<IWasteManagement> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteManagement.byId(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wasteManagement),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating waste management ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a waste management by setting its state to inactive
   * @param id Waste management ID
   * @returns Promise with operation result
   */
  async softDeleteWasteManagement(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteManagement.changeState(id)}`, {
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
      console.error(`Error soft deleting waste management ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single waste management by ID
   * @param id Waste management ID
   * @returns Promise with waste management data
   */
  async findById(id: string | number): Promise<IWasteManagement> {
    try {
      const response = await fetch(`${ENDPOINTS.wasteManagement.byId(id)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching waste management ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const wasteManagementService = new WasteManagementService();

export default wasteManagementService;