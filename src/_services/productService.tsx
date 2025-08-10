import { ENDPOINTS } from '@/lib/constants';
import { IProducts } from '@eon-lib/eon-mongoose';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * Service for managing products data
 */
class ProductService {
  /**
   * Get all products
   * @returns Promise with all products
   */
  async findAll(): Promise<IProducts[]> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.products.base);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param product Product data
   * @returns Promise with created product
   */
  async createProduct(product: Partial<IProducts>): Promise<IProducts> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      
      const productData: Partial<IProducts> = {
        workId: product.workId,
        category: product.category,
        product: product.product,
        unitOfMeasurement: product.unitOfMeasurement,
        amountPerHour: product.amountPerHour,
        amount: product.amount,
        netUnitValue: product.netUnitValue,
        totalValue: product.totalValue,
        return: product.return,
        machineryRelationship: product.machineryRelationship,
        packagingCode: product.packagingCode,
        invoiceNumber: product.invoiceNumber,
        createdBy: user?.id || '',
        updatedBy: user?.id || '',
      };

      console.log(productData);
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        productData.propertyId = propertyId;
      }

      const response = await fetch(ENDPOINTS.products.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   * @param id Product ID
   * @param product Updated product data
   * @returns Promise with updated product
   */
  async updateProduct(id: string | number, product: Partial<IProducts>): Promise<IProducts> {
    try {
      const { propertyId, user } = useAuthStore.getState();
      const productData = { 
        ...product,
        updatedBy: user?.id || '',
      };
      delete (productData as any).__v;
      
      // Add propertyId if available
      if (propertyId) {
        // @ts-ignore - Adding a property that might not be in the interface but required by API
        productData.propertyId = propertyId;
      }
      
      const response = await fetch(ENDPOINTS.products.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
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
   * Delete a product
   * @param id Product ID
   * @returns Promise with operation result
   */
  async deleteProduct(id: string | number): Promise<any> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.products.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
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
   * Get a single product by ID
   * @param id Product ID
   * @returns Promise with product data
   */
  async findById(id: string | number): Promise<IProducts> {
    try {
      const { propertyId } = useAuthStore.getState();
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.products.byId(id));
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
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
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService; 