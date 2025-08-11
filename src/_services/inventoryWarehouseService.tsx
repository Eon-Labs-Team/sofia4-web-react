import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryWarehouse } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing inventory warehouse data (new inventory system)
 */
class InventoryWarehouseService {
  /**
   * Get all inventory warehouses
   */
  async findAll(): Promise<IInventoryWarehouse[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryWarehouse.findAll, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const warehouses = await response.json();
      return warehouses.data || warehouses;
    } catch (error) {
      console.error('Error fetching inventory warehouses:', error);
      throw error;
    }
  }

  /**
   * Get central warehouses only (propertyId = '0')
   */
  async getCentralWarehouses(): Promise<IInventoryWarehouse[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryWarehouse.central, {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': '0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const warehouses = await response.json();
      return warehouses.data || warehouses;
    } catch (error) {
      console.error('Error fetching central warehouses:', error);
      throw error;
    }
  }

  /**
   * Get property warehouses only (propertyId != '0')
   */
  async getPropertyWarehouses(): Promise<IInventoryWarehouse[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryWarehouse.property, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const warehouses = await response.json();
      return warehouses.data || warehouses;
    } catch (error) {
      console.error('Error fetching property warehouses:', error);
      throw error;
    }
  }

  /**
   * Get a single warehouse by ID
   */
  async findById(id: string): Promise<IInventoryWarehouse> {
    try {
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching warehouse ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new inventory warehouse
   */
  async createWarehouse(warehouseData: {
    name: string;
    propertyId: string;
    location: {
      name: string;
      capacity?: number;
    };
    status?: boolean;
  }, propertyId?: string | number | null): Promise<IInventoryWarehouse> {
    try {
      const warehouseDataData: {
    name: string;
    propertyId: string;
    location: {
      name: string;
      capacity?: number;
    };
    status?: boolean;
  } = {
        ...warehouseData,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: warehouseData.state !== undefined ? warehouseData.state : true
      };

      const response = await fetch(ENDPOINTS.inventoryWarehouse.base, {
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
      console.error('Error creating inventory warehouse:', error);
      throw error;
    }
  }

  /**
   * Update an existing inventory warehouse
   */
  async updateWarehouse(id: string, warehouseData: Partial<IInventoryWarehouse>): Promise<IInventoryWarehouse> {
    try {
      const cleanData = { ...warehouseData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating warehouse ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an inventory warehouse
   */
  async deleteWarehouse(id: string): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting warehouse ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryWarehouseService = new InventoryWarehouseService();

export default inventoryWarehouseService;