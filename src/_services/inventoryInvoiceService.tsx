import { ENDPOINTS } from '@/lib/constants';
import type { IInventoryInvoice } from '@eon-lib/eon-mongoose';
import authService from './authService';

/**
 * Service for managing inventory invoices (new inventory system)
 */
class InventoryInvoiceService {
  /**
   * Get a single invoice by ID
   */
  async findById(id: string): Promise<IInventoryInvoice> {
    try {
      const response = await fetch(ENDPOINTS.inventoryInvoice.byId(id), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber: string): Promise<IInventoryInvoice[]> {
    try {
      const response = await fetch(ENDPOINTS.inventoryInvoice.byInvoiceNumber(invoiceNumber), {
        headers: authService.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const invoices = await response.json();
      return invoices.data || invoices;
    } catch (error) {
      console.error(`Error fetching invoice by number ${invoiceNumber}:`, error);
      throw error;
    }
  }

  /**
   * Create a basic invoice
   */
  async createInvoice(invoiceData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
    propertyId: string;
  }, propertyId?: string | number | null): Promise<IInventoryInvoice> {
    try {
      const invoiceDataData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
    propertyId: string;
  } = {
        ...invoiceData,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: invoiceData.state !== undefined ? invoiceData.state : true
      };

      const response = await fetch(ENDPOINTS.inventoryInvoice.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating inventory invoice:', error);
      throw error;
    }
  }

  /**
   * Create invoice for central warehouse (propertyId = '0')
   */
  async createCentralInvoice(invoiceData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
  }, propertyId?: string | number | null): Promise<IInventoryInvoice> {
    try {
      const invoiceDataData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
  } = {
        ...invoiceData,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: invoiceData.state !== undefined ? invoiceData.state : true
      };

      const response = await fetch(ENDPOINTS.inventoryInvoice.central, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': '0', // Central warehouse marker
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating central invoice:', error);
      throw error;
    }
  }

  /**
   * Create invoice for property warehouse
   */
  async createPropertyInvoice(invoiceData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
    propertyId: string;
  }, propertyId?: string | number | null): Promise<IInventoryInvoice> {
    try {
      const invoiceDataData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      lotNumber?: string;
      lotName?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
    }>;
    warehouseId: string;
    totalAmount: number;
    status?: string;
    propertyId: string;
  } = {
        ...invoiceData,
        // @ts-ignore
        propertyId, // Add propertyId to the data
        state: invoiceData.state !== undefined ? invoiceData.state : true
      };

      const response = await fetch(ENDPOINTS.inventoryInvoice.property, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'propertyId': userPropertyId?.toString() || '',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating property invoice:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: string, invoiceData: Partial<IInventoryInvoice>): Promise<IInventoryInvoice> {
    try {
      const cleanData = { ...invoiceData };
      
      // Remove version field if it exists
      if ('__v' in cleanData) {
        delete (cleanData as any).__v;
      }
      
      const response = await fetch(ENDPOINTS.inventoryInvoice.byId(id), {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete (soft delete) an invoice
   */
  async deleteInvoice(id: string): Promise<any> {
    try {
      const response = await fetch(ENDPOINTS.inventoryInvoice.byId(id), {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate total amount for an invoice based on items
   */
  calculateTotalAmount(items: Array<{ quantity: number; unitPrice: number }>): number {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  }

  /**
   * Validate invoice data before submission
   */
  validateInvoiceData(invoiceData: {
    invoiceNumber: string;
    supplier: string;
    date: Date;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    warehouseId: string;
    totalAmount: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!invoiceData.invoiceNumber || invoiceData.invoiceNumber.trim() === '') {
      errors.push('Invoice number is required');
    }

    if (!invoiceData.supplier || invoiceData.supplier.trim() === '') {
      errors.push('Supplier is required');
    }

    if (!invoiceData.date) {
      errors.push('Invoice date is required');
    }

    if (!invoiceData.warehouseId || invoiceData.warehouseId.trim() === '') {
      errors.push('Warehouse ID is required');
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      invoiceData.items.forEach((item, index) => {
        if (!item.productId || item.productId.trim() === '') {
          errors.push(`Item ${index + 1}: Product ID is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.unitPrice || item.unitPrice <= 0) {
          errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
        }
      });
    }

    // Validate calculated total
    const calculatedTotal = this.calculateTotalAmount(invoiceData.items);
    if (Math.abs(calculatedTotal - invoiceData.totalAmount) > 0.01) {
      errors.push(`Total amount mismatch: calculated ${calculatedTotal}, provided ${invoiceData.totalAmount}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create a singleton instance
const inventoryInvoiceService = new InventoryInvoiceService();

export default inventoryInvoiceService;