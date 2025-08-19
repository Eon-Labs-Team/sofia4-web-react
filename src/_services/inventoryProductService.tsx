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
  async createProduct(productData: Partial<IInventoryProduct>): Promise<IInventoryProduct> {
    try {
      const requestData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        subcategory: productData.subcategory,
        structureType: productData.structureType,
        quantity: productData.quantity,
        unit: productData.unit,
        measurementUnit: productData.measurementUnit,
        hitlistCode: productData.hitlistCode,
        minimumQuantity: productData.minimumQuantity,
        minimumUsageQuantity: productData.minimumUsageQuantity,
        maximumUsageQuantity: productData.maximumUsageQuantity,
        carenceDays: productData.carenceDays,
        reentryHours: productData.reentryHours,
        minimumDose: productData.minimumDose,
        maximumDose: productData.maximumDose,
        treatments: productData.treatments,
        costClassification: productData.costClassification,
        costSubclassification: productData.costSubclassification,
        isDeleted: productData.isDeleted || false,
        warehouseId: productData.warehouseId
      };

      console.log('Creating product with data:', requestData);

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

  /**
   * Get products that have active lots for a specific property
   * This method combines products with their lot information to show products with active lots
   * (regardless of stock amount - includes 0 or negative stock for consumption scenarios)
   */
  async getProductsWithStockByPropertyId(propertyId: string): Promise<any[]> {
    try {
      // First, get all inventory products
      const allProducts = await this.findAll();
      
      // Then, for each product, check if it has active lots with stock in the property
      const productsWithStock = await Promise.all(
        allProducts.map(async (product) => {
          try {
            // Get active lots for this product and property
            const response = await fetch(ENDPOINTS.inventoryLot.activeByProductIdAndPropertyId(product._id, propertyId), {
              headers: authService.getAuthHeaders(),
            });
            
            if (!response.ok) {
              // If we can't get lots for this product, skip it
              return null;
            }
            
            const lots = await response.json();
            const lotsData = lots.data || lots || [];
            
            // Calculate total stock for this product in this property
            const totalStock = lotsData.reduce((sum: number, lot: any) => {
              return sum + (lot.quantity || 0);
            }, 0);
            
            // Return all products that have active lots in this property (regardless of stock amount)
            // This allows for products with 0 or negative stock to be selected for consumption
            if (lotsData.length > 0) {
              return {
                ...product,
                availableStock: totalStock,
                activeLots: lotsData.length,
                // Add properties to make it compatible with existing ProductSelectionModal
                name: product.name,
                category: product.category,
                description: product.description,
                unitOfMeasurement: product.unit || product.measurementUnit,
                brand: (product as any).brand || '',
                code: product.hitlistCode || '',
              };
            }
            
            return null;
          } catch (error) {
            console.warn(`Error checking stock for product ${product._id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values (products without stock)
      const filteredProducts = productsWithStock.filter(product => product !== null);
      
      console.log(`Found ${filteredProducts.length} products with stock for property ${propertyId}`);
      return filteredProducts;
      
    } catch (error) {
      console.error(`Error fetching products with stock for property ${propertyId}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const inventoryProductService = new InventoryProductService();

export default inventoryProductService;