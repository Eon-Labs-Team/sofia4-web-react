import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryWarehouse } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing inventory warehouse data (new inventory system)
 */
class InventoryWarehouseService {
  /**
   * Get all inventory warehouses
   */
  async findAll(): Promise<IInventoryWarehouse[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.findAll, {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.property, {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
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
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
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
  }): Promise<IInventoryWarehouse> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();
      
      const requestData = {
        name: warehouseData.name,
        propertyId: warehouseData.propertyId,
        location: warehouseData.location,
        status: warehouseData.status !== undefined ? warehouseData.status : true,
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
      const { propertyId } = useAuthStore.getState();
      const cleanData = { ...warehouseData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
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
      console.error(`Error updating warehouse ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an inventory warehouse
   */
  async deleteWarehouse(id: string): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryWarehouse.byId(id), {
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
      console.error(`Error deleting warehouse ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryWarehouseService = new InventoryWarehouseService();

export default inventoryWarehouseService;