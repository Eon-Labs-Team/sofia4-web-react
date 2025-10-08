import { ENDPOINTS } from '@/lib/constants';
import authService from './authService';
import { IProductSubcategory } from "@eon-lib/eon-mongoose/types";

/**
 * Service for managing product subcategories
 */
class ProductSubcategoryService {
  /**
   * Get all product subcategories by enterprise ID
   * @returns Promise with all product subcategories
   */
  async findByEnterpriseId(): Promise<IProductSubcategory[]> {
    try {
      const response = await fetch(authService.buildUrlWithParams(ENDPOINTS.subcategoryProduct.base), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product subcategories:', error);
      throw error;
    }
  }

  /**
   * Get all product subcategories (admin/global, not filtered by enterprise)
   * @returns Promise with all product subcategories
   */
  async findAll(): Promise<IProductSubcategory[]> {
    try {
      const response = await fetch(ENDPOINTS.subcategoryProduct.base, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const productSubcategoryData = await response.json();
      return productSubcategoryData.data || productSubcategoryData;
    } catch (error) {
      console.error('Error fetching all product subcategories:', error);
      throw error;
    }
  }

  /**
   * Create a new product subcategory
   * @param productSubcategory Product subcategory data
   * @returns Promise with created product subcategory
   */
  async createProductSubcategory(productSubcategory: Partial<IProductSubcategory>): Promise<IProductSubcategory> {
    try {
      
      const productSubcategoryData: Partial<IProductSubcategory> = {
        subcategoryName: (productSubcategory as any).description || productSubcategory.subcategoryName,
        categoryId: productSubcategory.categoryId,
        order: (productSubcategory as any).idOrder || (productSubcategory as any).order || 0,
        state: productSubcategory.state !== undefined ? productSubcategory.state : true,
        createdBy: authService.getCurrentUser()?.id || '',
        updatedBy: authService.getCurrentUser()?.id || ''
      };

      const response = await fetch(ENDPOINTS.subcategoryProduct.base, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(productSubcategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product subcategory:', error);
      throw error;
    }
  }

  /**
   * Update an existing product subcategory
   * @param id Product subcategory ID
   * @param productSubcategory Updated product subcategory data
   * @returns Promise with updated product subcategory
   */
  async updateProductSubcategory(id: string, productSubcategory: Partial<IProductSubcategory>): Promise<IProductSubcategory> {
    try {

      
      const productSubcategoryData = {
        ...productSubcategory,
        updatedBy: authService.getCurrentUser()?.id || ''
      };
      
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(productSubcategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating product subcategory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a product subcategory
   * @param id Product subcategory ID
   * @returns Promise with operation result
   */
  async softDeleteProductSubcategory(id: string): Promise<any> {
    try {

      const stateData = { state: false };
      
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(stateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting product subcategory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single product subcategory by ID
   * @param id Product subcategory ID
   * @returns Promise with product subcategory data
   */
  async findById(id: string): Promise<IProductSubcategory> {
    try {

      
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product subcategory ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const productSubcategoryService = new ProductSubcategoryService();

export default productSubcategoryService;