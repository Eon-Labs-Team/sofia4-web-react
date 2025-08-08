import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryLot } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing inventory lot data (new inventory system)
 */
class InventoryLotService {
  /**
   * Get all inventory lots
   */
  async findAll(): Promise<IInventoryLot[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.findAll, {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.byId(id), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.byProductId(productId), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
   * Get active lots by product ID
   */
  async getActiveByProductId(productId: string): Promise<IInventoryLot[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.activeByProductId(productId), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.activeByProductIdOrderedByExpiry(productId), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId: userPropertyId } = useAuthStore.getState();
      
      const requestData = {
        productId: lotData.productId,
        warehouseId: lotData.warehouseId,
        lotNumber: lotData.lotNumber,
        quantity: lotData.quantity,
        status: lotData.status || 'active',
        propertyId: lotData.propertyId,
        lotName: lotData.lotName,
        manufactureDate: lotData.manufactureDate,
        expiryDate: lotData.expiryDate,
        isDeleted: false,
      };

      const response = await fetch(ENDPOINTS.inventoryLot.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(requestData),
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
      const { propertyId } = useAuthStore.getState();
      const cleanData = { ...lotData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryLot.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryLot.byId(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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