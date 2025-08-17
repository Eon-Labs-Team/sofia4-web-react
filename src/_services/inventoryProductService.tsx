import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryProduct } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing inventory product data (new inventory system)
 */
class InventoryProductService {
  /**
   * Get all inventory products
   */
  async findAll(): Promise<IInventoryProduct[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryProduct.findAll, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const products = await response.json();
      return products.data || products;
    } catch (error) {
      console.error('Error fetching inventory products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async findById(id: string): Promise<IInventoryProduct> {
    try {
      const response = await fetch(ENDPOINTS.inventoryProduct.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get product by name
   */
  async findByName(name: string): Promise<IInventoryProduct> {
    try {
      const response = await fetch(ENDPOINTS.inventoryProduct.byName(name), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Create a new inventory product
   */
  async createProduct(productData): Promise<IInventoryProduct> {
    try {
      const requestData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        structureType: productData.structureType,
        unit: productData.unit,
        isDeleted: false,
        warehouseId: productData.warehouseId,
        quantity: productData.quantity
      };

      const response = await fetch(ENDPOINTS.inventoryProduct.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating inventory product:', error);
      throw error;
    }
  }

  /**
   * Update an existing inventory product
   */
  async updateProduct(id: string, productData: Partial<IInventoryProduct>): Promise<IInventoryProduct> {
    try {
      const cleanData = { ...productData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryProduct.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an inventory product
   */
  async deleteProduct(id: string): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.inventoryProduct.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get product with lots (stock information)
   */
  async getProductWithLots(id: string): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.inventoryProduct.byId(id)}/withLots`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product with lots ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get stock levels for a product (central/property breakdown)
   */
  async getStockLevels(id: string): Promise<any> {
    try {
      const response = await fetch(`${ENDPOINTS.inventoryProduct.byId(id)}/stockLevels`, {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching stock levels for product ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryProductService = new InventoryProductService();

export default inventoryProductService;