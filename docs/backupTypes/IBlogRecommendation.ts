import { document } from './document';

/**
 * Interface representing a Blog Recommendation record.
 */
export interface IBlogRecommendation extends document {
  date: string | Date;         // Date of the recommendation (YYYY-MM-DD string or Date object)
  hour: string;            // Time of the recommendation (HH:MM format)
  barracksLot: string;     // Associated barracks or lot identifier
  latitude?: number;       // Latitude coordinate
  longitude?: number;      // Longitude coordinate
  observation: string;     // Text observation or recommendation
  image1?: string;         // URL for the first image (optional)
  image2?: string;         // URL for the second image (optional)
  image3?: string;         // URL for the third image (optional)
  state: boolean;          // Active state of the record
}
