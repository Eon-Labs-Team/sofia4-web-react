import { ENDPOINTS } from '@/lib/constants';
import { IInventoryMovement } from '@/types/IInventoryMovement';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing inventory movement data
 */
class InventoryMovementService {
  /**
   * Get all inventory movements
   * @returns Promise with all inventory movements
   */
  async findAll(): Promise<IInventoryMovement[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.inventoryMovement.findAll);
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
      
      const movements = await response.json();
      return movements.data || movements;
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      throw error;
    }
  }

  /**
   * Get a single inventory movement by ID
   * @param id Movement ID
   * @returns Promise with movement data
   */
  async findById(id: string | number): Promise<IInventoryMovement> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.inventoryMovement.byId(id));
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
      console.error(`Error fetching inventory movement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get movements by product ID
   * @param productId Product ID
   * @returns Promise with movements data
   */
  async findByProductId(productId: string): Promise<IInventoryMovement[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(`${ENDPOINTS.inventoryMovement.base}/byProductId/${productId}`);
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
      
      const movements = await response.json();
      return movements.data || movements;
    } catch (error) {
      console.error(`Error fetching movements by product ID ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get movements by lot ID
   * @param lotId Lot ID
   * @returns Promise with movements data
   */
  async findByLotId(lotId: string): Promise<IInventoryMovement[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(`${ENDPOINTS.inventoryMovement.base}/byLotId/${lotId}`);
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
      
      const movements = await response.json();
      return movements.data || movements;
    } catch (error) {
      console.error(`Error fetching movements by lot ID ${lotId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new inventory movement
   * @param movement Movement data
   * @returns Promise with created movement
   */
  async createMovement(movement: Partial<IInventoryMovement>): Promise<IInventoryMovement> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const movementData: Partial<IInventoryMovement> = {
        productId: movement.productId,
        lotId: movement.lotId,
        warehouseId: movement.warehouseId,
        movementType: movement.movementType,
        quantity: movement.quantity,
        date: movement.date,
        reference: movement.reference,
        notes: movement.notes,
        unitCost: movement.unitCost,
        movementDate: movement.movementDate,
        state: movement.state !== undefined ? movement.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        movementData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.inventoryMovement.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(movementData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      throw error;
    }
  }

  /**
   * Update an existing inventory movement
   * @param id Movement ID
   * @param movement Updated movement data
   * @returns Promise with updated movement
   */
  async updateMovement(id: string | number, movement: Partial<IInventoryMovement>): Promise<IInventoryMovement> {
    try {
      const { propertyId } = useAuthStore.getState();
      const movementData = { ...movement };
      
      // Remove version field if it exists
      if ('__v' in movementData) {
        delete (movementData as any).__v;
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        movementData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.inventoryMovement.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(movementData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating inventory movement ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete an inventory movement by setting its state to inactive
   * @param id Movement ID
   * @returns Promise with operation result
   */
  async deleteMovement(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const stateData: any = { 
        state: false
      };
      
      // Add propertyId if available
      if (propertyId) {
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.inventoryMovement.byId(id), {
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
      console.error(`Error deleting inventory movement ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryMovementService = new InventoryMovementService();

export default inventoryMovementService; 