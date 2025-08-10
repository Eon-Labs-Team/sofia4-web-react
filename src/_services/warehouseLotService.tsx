import { ENDPOINTS } from '@/lib/constants';
// @ts-ignore
import { IWarehouseLot } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing warehouse lot data
 */
class WarehouseLotService {
  /**
   * Get all warehouse lots
   * @returns Promise with all warehouse lots
   */
  async findAll(): Promise<IWarehouseLot[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.warehouseLots.findAll);
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
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error('Error fetching warehouse lots:', error);
      throw error;
    }
  }

  /**
   * Get a single warehouse lot by ID
   * @param id Lot ID
   * @returns Promise with lot data
   */
  async findById(id: string | number): Promise<IWarehouseLot> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.warehouseLots.byId(id));
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
      console.error(`Error fetching warehouse lot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get lots by product ID
   * @param productId Product ID
   * @returns Promise with lots data
   */
  async findByProductId(productId: string): Promise<IWarehouseLot[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(`${ENDPOINTS.warehouseLots.base}/byProductId/${productId}`);
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
      
      const lots = await response.json();
      return lots.data || lots;
    } catch (error) {
      console.error(`Error fetching lots by product ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new warehouse lot
   * @param lot Lot data
   * @returns Promise with created lot
   */
  async createLot(lot: Partial<IWarehouseLot>): Promise<IWarehouseLot> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const lotData: Partial<IWarehouseLot> = {
        productId: lot.productId,
        batchNumber: lot.batchNumber,
        lotNumber: lot.lotNumber,
        warehouseId: lot.warehouseId,
        quantity: lot.quantity,
        productionDate: lot.productionDate,
        expiryDate: lot.expiryDate,
        supplier: lot.supplier,
        cost: lot.cost,
        status: lot.status !== undefined ? lot.status : true,
        isDeleted: lot.isDeleted !== undefined ? lot.isDeleted : false,
        state: lot.state !== undefined ? lot.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        lotData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.warehouseLots.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(lotData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating warehouse lot:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouse lot
   * @param id Lot ID
   * @param lot Updated lot data
   * @returns Promise with updated lot
   */
  async updateLot(id: string | number, lot: Partial<IWarehouseLot>): Promise<IWarehouseLot> {
    try {
      const { propertyId } = useAuthStore.getState();
      const lotData = { ...lot };
      
      // Remove version field if it exists
      if ('__v' in lotData) {
        delete (lotData as any).__v;
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        lotData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouseLots.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(lotData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating warehouse lot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a warehouse lot by setting its state to inactive
   * @param id Lot ID
   * @returns Promise with operation result
   */
  async deleteLot(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const stateData: any = { 
        state: false,
        isDeleted: true,
        status: false
      };
      
      // Add propertyId if available
      if (propertyId) {
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouseLots.byId(id), {
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
      console.error(`Error deleting warehouse lot ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const warehouseLotService = new WarehouseLotService();

export default warehouseLotService; 