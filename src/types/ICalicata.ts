import { document } from './document';

/**
 * Interface representing a Calicata (Soil Pit) record.
 * TODO: Define the specific fields for Calicata based on requirements.
 */
export interface ICalicata extends document {
  // Example fields (replace with actual required fields)
  date: string | Date;      // Date of the calicata (YYYY-MM-DD or Date object)
  location?: string;       // General location description
  barracks?: string;       // Associated barracks identifier (if applicable)
  latitude?: number;       // Latitude coordinate (optional)
  longitude?: number;      // Longitude coordinate (optional)
  depth?: number;          // Depth of the pit (e.g., in cm)
  observations?: string;   // General observations
  soilTexture?: string;    // Dominant soil texture
  humidityLevel?: string;  // Estimated humidity level (e.g., 'Dry', 'Moist', 'Wet')
  rootDensity?: string;    // Estimated root density (e.g., 'Low', 'Medium', 'High')
  image?: string;          // URL for an image (optional)
  
  state: boolean;          // Active state of the record
}
