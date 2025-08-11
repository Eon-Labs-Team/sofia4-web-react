import { ENDPOINTS } from '@/lib/constants';
import { IInventoryMovement } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';
import authService from './authService';

/**
 * Service for managing inventory movement data
 */
class InventoryMovementService {
  /**
   * Get all inventory movements for a specific property
   * @param propertyId The ID of the property to get inventory movements for
   * @returns Promise with inventory movements for the property
   */
  async findAll(propertyId?: string | number | null): Promise<IInventoryMovement[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.inventoryMovement.findAll}?propertyId=${propertyId}`
        : `${ENDPOINTS.inventoryMovement.findAll}`;
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
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
      const response = await fetch(ENDPOINTS.inventoryMovement.byId(id), {
        headers: authService.getAuthHeaders(),
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
   * @param propertyId The ID of the property to filter by
   * @returns Promise with movements data
   */
  async findByProductId(productId: string, propertyId?: string | number | null): Promise<IInventoryMovement[]> {
    try {
      // If propertyId is provided, add it as a query parameter
      const url = propertyId 
        ? `${ENDPOINTS.inventoryMovement.byProductId(productId)}?propertyId=${propertyId}`
        : ENDPOINTS.inventoryMovement.byProductId(productId);
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
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
   * Get movements history for all products in a warehouse
   * @param warehouseId Warehouse ID
   * @param productIds Array of product IDs that have lots in this warehouse
   * @returns Promise with all movements data sorted by creation date
   */
  async getWarehouseHistory(warehouseId: string, productIds: string[]): Promise<IInventoryMovement[]> {
    try {
      const allMovements: IInventoryMovement[] = [];
      
      // Fetch history for each product in the warehouse
      for (const productId of productIds) {
        try {
          const { propertyId } = useAuthStore.getState();
          
          const response = await fetch(ENDPOINTS.inventoryMovement.history(warehouseId, productId), {
            headers: {
              'Content-Type': 'application/json',
              'propertyId': propertyId?.toString() || '',
            },
          });
          
          if (response.ok) {
            const movements = await response.json();
            const movementsData = movements.data || movements;
            if (Array.isArray(movementsData)) {
              allMovements.push(...movementsData);
            }
          }
        } catch (productError) {
          console.warn(`Error fetching history for product ${productId} in warehouse ${warehouseId}:`, productError);
          // Continue with other products even if one fails
        }
      }
      
      // Sort by creation date, most recent first
      allMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return allMovements;
    } catch (error) {
      console.error(`Error fetching warehouse history for ${warehouseId}:`, error);
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
        headers: authService.getAuthHeaders(),
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
   * @param propertyId The ID of the property this movement belongs to
   * @returns Promise with created movement
   */
  async createMovement(movement: Partial<any>, propertyId?: string | number | null): Promise<IInventoryMovement> {
    try {
      const movementData: Partial<any> = {
        ...movement,
        // @ts-ignore
        propertyId, // Add propertyId to the movement data
        state: movement.state !== undefined ? movement.state : true
      };

      const response = await fetch(ENDPOINTS.inventoryMovement.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
      const movementData = { ...movement };
      
      // Remove version field if it exists
      if ('__v' in movementData) {
        delete (movementData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryMovement.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      const response = await fetch(ENDPOINTS.inventoryMovement.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
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
        headers: authService.getAuthHeaders(),
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
        headers: authService.getAuthHeaders(),
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
        headers: authService.getAuthHeaders(),
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