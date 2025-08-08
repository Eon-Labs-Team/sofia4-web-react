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
      
      const response = await fetch(ENDPOINTS.inventoryMovement.byProductId(productId), {
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
      
      const response = await fetch(ENDPOINTS.inventoryMovement.byLotId(lotId), {
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

  // ==================== SPECIALIZED OPERATIONS ====================

  /**
   * Get movement history by warehouse and product
   */
  async getHistory(warehouseId: string, productId: string): Promise<IInventoryMovement[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryMovement.history(warehouseId, productId), {
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
      console.error(`Error fetching history for warehouse ${warehouseId} and product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get complete history by product
   */
  async getCompleteHistory(productId: string): Promise<IInventoryMovement[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryMovement.completeHistory(productId), {
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
      console.error(`Error fetching complete history for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Assign stock from central warehouse to property warehouse
   */
  async assignStock(assignData: {
    productId: string;
    quantity: number;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    propertyId: string;
    comments?: string;
  }): Promise<any> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();

      const response = await fetch(ENDPOINTS.inventoryMovement.assign, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(assignData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning stock:', error);
      throw error;
    }
  }

  /**
   * Consume product with FIFO logic
   */
  async consumeProduct(consumeData: {
    productId: string;
    quantity: number;
    warehouseId: string;
    propertyId: string;
    allowNegativeStock?: boolean;
    negativeStockLimit?: number;
    comments?: string;
  }): Promise<any> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();

      const response = await fetch(ENDPOINTS.inventoryMovement.consume, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(consumeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error consuming product:', error);
      throw error;
    }
  }

  /**
   * Move product between warehouses
   */
  async moveProduct(moveData: {
    productId: string;
    quantity: number;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    propertyId: string;
    comments?: string;
  }): Promise<any> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();

      const response = await fetch(ENDPOINTS.inventoryMovement.move, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(moveData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error moving product:', error);
      throw error;
    }
  }

  /**
   * Manual stock change
   */
  async manualStockChange(changeData: {
    productId: string;
    warehouseId: string;
    newQuantity: number;
    reason: string;
    propertyId: string;
  }): Promise<any> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();

      const response = await fetch(ENDPOINTS.inventoryMovement.manualChange, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(changeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making manual stock change:', error);
      throw error;
    }
  }

  /**
   * Restore stock
   */
  async restoreStock(restoreData: {
    productId: string;
    quantity: number;
    warehouseId: string;
    propertyId: string;
    comments?: string;
  }): Promise<any> {
    try {
      const { propertyId: userPropertyId } = useAuthStore.getState();

      const response = await fetch(ENDPOINTS.inventoryMovement.restore, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(restoreData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error restoring stock:', error);
      throw error;
    }
  }

  /**
   * Export movements report
   */
  async exportReport(productId: string): Promise<Blob> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const response = await fetch(ENDPOINTS.inventoryMovement.exportReport(productId), {
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error(`Error exporting report for product ${productId}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryMovementService = new InventoryMovementService();

export default inventoryMovementService; 