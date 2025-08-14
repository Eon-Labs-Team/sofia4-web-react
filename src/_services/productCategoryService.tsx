import { ENDPOINTS } from '@/lib/constants';
import authService from './authService';
import { IProductCategory } from '@eon-lib/eon-mongoose';

/**
 * Service for managing product categories
 */
class ProductCategoryService {
  /**
   * Get all product categories by enterprise ID
   * @returns Promise with all product categories
   */
  async findByEnterpriseId(): Promise<IProductCategory[]> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.productCategory.byEnterpriseId), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
  }

  /**
   * Get all product categories (admin/global, not filtered by enterprise)
   * @returns Promise with all product categories
   */
  async findAll(): Promise<IProductCategory[]> {
    try {
      const response = await fetch(ENDPOINTS.productCategory.base, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const productCategoryData = await response.json();
      return productCategoryData.data || productCategoryData;
    } catch (error) {
      console.error('Error fetching all product categories:', error);
      throw error;
    }
  }

  /**
   * Create a new product category
   * @param productCategory Product category data
   * @returns Promise with created product category
   */
  async createProductCategory(productCategory: Partial<IProductCategory>): Promise<IProductCategory> {
    try {
      
      const productCategoryData: Partial<IProductCategory> = {
        categoryName: (productCategory as any).description || productCategory.categoryName,
        order: (productCategory as any).idOrder || (productCategory as any).order || 0,
        state: productCategory.state !== undefined ? productCategory.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.productCategory.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(productCategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product category:', error);
      throw error;
    }
  }

  /**
   * Update an existing product category
   * @param id Product category ID
   * @param productCategory Updated product category data
   * @returns Promise with updated product category
   */
  async updateProductCategory(id: string, productCategory: Partial<IProductCategory>): Promise<IProductCategory> {
    try {

      
      const productCategoryData = {
        ...productCategory,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.productCategory.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(productCategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating product category ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a product category
   * @param id Product category ID
   * @returns Promise with operation result
   */
  async softDeleteProductCategory(id: string): Promise<any> {
    try {

      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.productCategory.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting product category ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single product category by ID
   * @param id Product category ID
   * @returns Promise with product category data
   */
  async findById(id: string): Promise<IProductCategory> {
    try {

      
      const response = await fetch(ENDPOINTS.productCategory.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product category ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const productCategoryService = new ProductCategoryService();

export default productCategoryService; 