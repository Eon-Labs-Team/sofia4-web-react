import { ENDPOINTS } from '@/lib/constants';
// @ts-ignore
import { IWarehouseProduct } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing warehouse product data
 */
class WarehouseProductService {
  /**
   * Get all warehouse products
   * @returns Promise with all warehouse products
   */
  async findAll(): Promise<IWarehouseProduct[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.warehouseProducts.findAll);
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
      
      const products = await response.json();
      return products.data || products;
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
      throw error;
    }
  }

  /**
   * Get a single warehouse product by ID
   * @param id Product ID
   * @returns Promise with product data
   */
  async findById(id: string | number): Promise<IWarehouseProduct> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.warehouseProducts.byId(id));
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
      console.error(`Error fetching warehouse product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a warehouse product by name
   * @param name Product name
   * @returns Promise with product data
   */
  async findByName(name: string): Promise<IWarehouseProduct> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.warehouseProducts.byName(name));
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
      console.error(`Error fetching warehouse product by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Create a new warehouse product
   * @param product Product data
   * @returns Promise with created product
   */
  async createProduct(product: Partial<IWarehouseProduct>): Promise<IWarehouseProduct> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const productData: Partial<IWarehouseProduct> = {
        name: product.name,
        description: product.description,
        category: product.category,
        structureType: product.structureType,
        unit: product.unit,
        price: product.price,
        minStock: product.minStock,
        maxStock: product.maxStock,
        status: product.status || "active",
        state: product.state !== undefined ? product.state : true,
      };
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        productData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.warehouseProducts.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating warehouse product:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouse product
   * @param id Product ID
   * @param product Updated product data
   * @returns Promise with updated product
   */
  async updateProduct(id: string | number, product: Partial<IWarehouseProduct>): Promise<IWarehouseProduct> {
    try {
      const { propertyId } = useAuthStore.getState();
      const productData = { ...product };
      
      // Remove version field if it exists
      if ('__v' in productData) {
        delete (productData as any).__v;
      }
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        productData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouseProducts.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': propertyId?.toString() || '',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating warehouse product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a warehouse product by setting its state to inactive
   * @param id Product ID
   * @returns Promise with operation result
   */
  async deleteProduct(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      const stateData: any = { 
        state: false,
        status: "inactive"
      };
      
      // Add propertyId if available
      if (propertyId) {
        stateData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.warehouseProducts.byId(id), {
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
      console.error(`Error deleting warehouse product ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const warehouseProductService = new WarehouseProductService();

export default warehouseProductService; 