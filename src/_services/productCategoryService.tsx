import { ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/lib/store/authStore';
import { IProductCategory } from '@/types/IProductCategory';

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
      const enterpriseId = "1234"; // todo: manejar session
      const { propertyId } = useAuthStore.getState();
      
      // Create a URL with query parameters
      const url = new URL(ENDPOINTS.productCategory.byEnterpriseId);
      if (propertyId) {
        url.searchParams.append('propertyId', propertyId.toString());
      }
      
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': enterpriseId
        },
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
   * Create a new product category
   * @param productCategory Product category data
   * @returns Promise with created product category
   */
  async createProductCategory(productCategory: Partial<IProductCategory>): Promise<IProductCategory> {
    try {
      const enterpriseId = "1234"; // todo: manejar session
      
      const productCategoryData: Partial<IProductCategory> = {
        description: productCategory.description,
        subCategory: productCategory.subCategory,
        numberSubCategory: productCategory.numberSubCategory,
        idOrder: productCategory.idOrder,
        state: productCategory.state !== undefined ? productCategory.state : true
      };

      const response = await fetch(ENDPOINTS.productCategory.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': enterpriseId
        },
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
      const enterpriseId = "1234"; // todo: manejar session
      
      const response = await fetch(ENDPOINTS.productCategory.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': enterpriseId
        },
        body: JSON.stringify(productCategory),
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
      const enterpriseId = "1234"; // todo: manejar session
      
      const response = await fetch(ENDPOINTS.productCategory.fullDelete(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': enterpriseId
        }
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
      const enterpriseId = "1234"; // todo: manejar session
      
      const response = await fetch(ENDPOINTS.productCategory.byId(id), {
        headers: {
          'Content-Type': 'application/json',
          'enterpriseId': enterpriseId
        },
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