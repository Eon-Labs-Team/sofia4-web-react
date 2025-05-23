import { ENDPOINTS } from '@/lib/constants';
import { Property } from '@/types/property';

/**
 * Service for managing property data
 */
class PropertyService {
  /**
   * Get all properties
   * @returns Promise with all properties
   */
  async findAll(): Promise<Property[]> {
    try {
      const response = await fetch(ENDPOINTS.properties.base, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const properties = await response.json();
      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Create a new property
   * @param property Property data
   * @returns Promise with created property
   */
  async createProperty(property: Partial<Property>): Promise<Property> {
    try {
      const propertyData: Partial<Property> = {
        // General Property Data
        propertyType: property.propertyType,
        country: property.country,
        propertyName: property.propertyName,
        internalAuthorizationCode: property.internalAuthorizationCode,
        orderPrefix: property.orderPrefix,
        taxId: property.taxId,
        businessName: property.businessName,
        legalRepresentative: property.legalRepresentative,
        address: property.address,
        city: property.city,
        district: property.district,
        region: property.region,
        businessActivity: property.businessActivity,
        email: property.email,
        phone: property.phone,
        plantedArea: property.plantedArea,
        totalArea: property.totalArea,
        climateViewerLocation: property.climateViewerLocation,
        status: property.status !== undefined ? property.status : true,

        // Geographic Location
        latDegrees: property.latDegrees,
        latMinutes: property.latMinutes,
        latSeconds: property.latSeconds,
        latDirection: property.latDirection,
        longDegrees: property.longDegrees,
        longMinutes: property.longMinutes,
        longSeconds: property.longSeconds,
        longDirection: property.longDirection,
        latitude: property.latitude,
        longitude: property.longitude,
        altitude: property.altitude,

        // Registration Records
        realEstateRegistration: property.realEstateRegistration,
        roleNumber: property.roleNumber,
        pagesYears: property.pagesYears,
        waterRights: property.waterRights,
        propertySpeciesList: property.propertySpeciesList,

        // BPA Manager
        administrator: property.administrator,
        administratorEmail: property.administratorEmail,
        administratorPhone: property.administratorPhone,
        bpaManager: property.bpaManager,
        bpaManagerEmail: property.bpaManagerEmail,
        bpaManagerPhone: property.bpaManagerPhone,

        enterpriseId: property.enterpriseId
      };

      const response = await fetch(ENDPOINTS.properties.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update an existing property
   * @param id Property ID
   * @param property Updated property data
   * @returns Promise with updated property
   */
  async updateProperty(id: string | number, property: Partial<Property>): Promise<Property> {
    try {
      const response = await fetch(ENDPOINTS.properties.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a property by setting its state to inactive
   * @param id Property ID
   * @returns Promise with operation result
   */
  async softDeleteProperty(id: string | number): Promise<any> {
    try {
      // Update only the status field to false
      const response = await fetch(ENDPOINTS.properties.byId(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error soft deleting property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a single property by ID
   * @param id Property ID
   * @returns Promise with property data
   */
  async findById(id: string | number): Promise<Property> {
    try {
      const response = await fetch(ENDPOINTS.properties.byId(id), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a property by name
   * @param name Property name
   * @returns Promise with property data
   */
  async findByName(name: string): Promise<Property> {
    try {
      const response = await fetch(ENDPOINTS.properties.byName(name), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching property by name ${name}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const propertyService = new PropertyService();

export default propertyService; 