import { document } from './document';

/**
 * Interface representing a Calicata (Soil Pit) record.
 */
export interface ICalicata extends document {
  date: string | Date;      // Date of the calicata
  fieldOrPlot: string;      // Field or plot identifier
  depth?: number;           // Depth of the pit (e.g., in cm)
  observations?: string;    // General observations
  responsible: string;      // Person responsible for the record
  image1?: string;          // URL for an image (optional)
  image2?: string;          // URL for another image (optional)
  image3?: string;          // URL for another image (optional)
  signature?: string;       // Signature image URL
  state: boolean;           // Active state of the record
}
