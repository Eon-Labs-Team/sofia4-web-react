import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryLot } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing inventory lot data (new inventory system)
 */
class InventoryLotService {
  /**
   * Get all inventory lots
   */
  async findAll(): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.inventoryLot.findAll), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error('Error fetching inventory lots:', error);
      throw error;
    }
  }

  /**
   * Get a single lot by ID
   */
  async findById(id: string): Promise<IInventoryLot> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.inventoryLot.byId(id)), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching lot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get lots by product ID
   */
  async getByProductId(productId: string): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.byProductId(productId), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching lots for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get lots by warehouse ID
   */
  async getByWarehouseId(warehouseId: string): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.byWarehouseId(warehouseId), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching lots for warehouse ${warehouseId}:`, error);
      throw error;
    }
  }

  /**
   * Get active lots by product ID
   */
  async getActiveByProductId(productId: string): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.activeByProductId(productId), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching active lots for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get active lots by product ID ordered by expiry (FIFO)
   */
  async getActiveByProductIdOrderedByExpiry(productId: string): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.activeByProductIdOrderedByExpiry(productId), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching active lots ordered by expiry for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get active lots by product ID and property ID
   */
  async getActiveByProductIdAndPropertyId(productId: string, propertyId: string): Promise<IInventoryLot[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.activeByProductIdAndPropertyId(productId, propertyId), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching active lots for product ${productId} and property ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new inventory lot
   */
  async createLot(lotData: {
    productId: string;
    warehouseId: string;
    lotNumber: string;
    quantity: number;
    status?: string;
    propertyId: string;
    lotName?: string;
    manufactureDate?: Date;
    expiryDate?: Date;
  }): Promise<IInventoryLot> {
    try {
      const cleanLotData = {
        ...lotData,
        //state: lotData.state !== undefined ? lotData.state : true
      };

      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.inventoryLot.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cleanLotData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating inventory lot:', error);
      throw error;
    }
  }

  /**
   * Update an existing inventory lot
   */
  async updateLot(id: string, lotData: Partial<IInventoryLot>): Promise<IInventoryLot> {
    try {
      const cleanData = { ...lotData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryLot.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating lot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an inventory lot
   */
  async deleteLot(id: string): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.inventoryLot.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting lot ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryLotService = new InventoryLotService();

export default inventoryLotService;