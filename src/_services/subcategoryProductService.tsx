import { ENDPOINTS } from '@/lib/constants';
import { ISubCategoryProduct } from '@/types/ISubCategoryProduct';

/**
 * Service for managing product subcategories
 */
class SubcategoryProductService {
  /**
   * Get all product subcategories
   * @returns Promise with all subcategories
   */
  async findAll(): Promise<ISubCategoryProduct[]> {
    try {
      const response = await fetch(ENDPOINTS.subcategoryProduct.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }

  /**
   * Create a new product subcategory
   * @param subcategory SubcategoryProduct data
   * @returns Promise with created subcategory
   */
  async createSubcategoryProduct(subcategory: Partial<ISubCategoryProduct>): Promise<ISubCategoryProduct> {
    try {
      const subcategoryData: Partial<ISubCategoryProduct> = {
        idOrder: subcategory.idOrder,
        description: subcategory.description,
        state: subcategory.state !== undefined ? subcategory.state : false,
      };

      const response = await fetch(ENDPOINTS.subcategoryProduct.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subcategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  }

  /**
   * Update an existing product subcategory
   * @param id SubcategoryProduct ID
   * @param subcategory Updated subcategory data
   * @returns Promise with updated subcategory
   */
  async updateSubcategoryProduct(id: string | number, subcategory: Partial<ISubCategoryProduct>): Promise<ISubCategoryProduct> {
    try {
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subcategory),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating subcategory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a subcategory by setting its state to inactive
   * @param id SubcategoryProduct ID
   * @returns Promise with operation result
   */
  async softDeleteSubcategoryProduct(id: string | number): Promise<any> {
    try {
      // Update only the state field to false
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting subcategory ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single product subcategory by ID
   * @param id SubcategoryProduct ID
   * @returns Promise with subcategory data
   */
  async findById(id: string | number): Promise<ISubCategoryProduct> {
    try {
      const response = await fetch(ENDPOINTS.subcategoryProduct.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching subcategory ${id}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const subcategoryProductService = new SubcategoryProductService();

export default subcategoryProductService; 