import { ENDPOINTS } from '@/lib/constants';
import { IWarehouse } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing warehouse data
 */
class WarehouseService {
  /**
   * Get all warehouses
   * @returns Promise with all warehouses
   */
  async findAll(): Promise<IWarehouse[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.warehouse.findAll);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
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
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  /**
   * Get a single warehouse by ID
   * @param id Warehouse ID
   * @returns Promise with warehouse data
   */
  async findById(id: string | number): Promise<IWarehouse> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.warehouse.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
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
   * Get a warehouse by name
   * @param name Warehouse name
   * @returns Promise with warehouse data
   */
  async findByName(name: string): Promise<IWarehouse> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.warehouse.byName(name));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
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
      console.error(`Error fetching warehouse by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Create a new warehouse
   * @param warehouse Warehouse data
   * @returns Promise with created warehouse
   */
  async createWarehouse(warehouse: Partial<IWarehouse>): Promise<IWarehouse> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const warehouseData: Partial<IWarehouse> = {
        warehouse: warehouse.warehouse,
        productHouse: warehouse.productHouse,
        productType: warehouse.productType,
        productName: warehouse.productName,
        activeIngredient: warehouse.activeIngredient,
        treatmentReason: warehouse.treatmentReason,
        category: warehouse.category,
        subCategory: warehouse.subCategory,
        unitMeasure: warehouse.unitMeasure,
        unitStock: warehouse.unitStock,
        lackDays: warehouse.lackDays,
        reentryHours: warehouse.reentryHours,
        classCost: warehouse.classCost,
        subClassCost: warehouse.subClassCost,
        warehouseState: warehouse.warehouseState,
        location: warehouse.location,
        netValue: warehouse.netValue,
        task: warehouse.task,
        totalPrice: warehouse.totalPrice,
        state: warehouse.state !== undefined ? warehouse.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        warehouseData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.warehouse.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(warehouseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouse
   * @param id Warehouse ID
   * @param warehouse Updated warehouse data
   * @returns Promise with updated warehouse
   */
  async updateWarehouse(id: string | number, warehouse: Partial<IWarehouse>): Promise<IWarehouse> {
    try {
      const { propertyId } = useAuthStore.getState();
      const warehouseData = { ...warehouse };
      
      // Remove version field if it exists
      if ('__v' in warehouseData) {
        delete (warehouseData as any).__v;
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        warehouseData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouse.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(warehouseData),
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
   * Soft delete a warehouse by setting its state to inactive
   * @param id Warehouse ID
   * @returns Promise with operation result
   */
  async deleteWarehouse(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const stateData: any = { 
        state: false,
        isDeleted: true 
      };
      
      // Add propertyId if available
      if (propertyId) {
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouse.byId(id), {
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
const warehouseService = new WarehouseService();

export default warehouseService; 