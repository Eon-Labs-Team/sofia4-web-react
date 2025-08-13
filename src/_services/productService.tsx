import { ENDPOINTS } from '@/lib/constants';
import { IProducts } from '@eon-lib/eon-mongoose';
import authService from './authService';

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
      const url = authService.buildUrlWithParams(ENDPOINTS.products.base);
      
      const response = await fetch(url, {
        headers: authService.getAuthHeaders(),
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
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || '',
      };

      console.log(productData);
      
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.products.base), {
        method: 'POST',
        headers: authService.getAuthHeaders(),
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
      const productData = { 
        ...product,
        updatedBy: authService.getCurrentUser()?.id || '',
      };
      delete (productData as any).__v;
      
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.products.byId(id)), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
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
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.products.byId(id));
      
      
      const response = await fetch(authService.buildUrlWithParams(url.toString()), {
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
   * Get a single product by ID
   * @param id Product ID
   * @returns Promise with product data
   */
  async findById(id: string | number): Promise<IProducts> {
    try {
      
      
      // Create URL with query parameters
      const url = new URL(ENDPOINTS.products.byId(id));
      
      
      const response = await fetch(authService.buildUrlWithParams(url.toString()), {
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
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService; 