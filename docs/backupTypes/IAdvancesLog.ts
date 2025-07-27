import { document } from './document';

/**
 * Interface representing an Advances Log record.
 * TODO: Define the specific fields for AdvancesLog based on requirements.
 */
export interface IAdvancesLog extends document {
  // Example fields (replace with actual required fields)
  timestamp: string | Date;   // Timestamp of the log entry
  userId?: string;           // ID of the user who performed the action (if applicable)
  userName?: string;         // Name of the user (if applicable)
  action: string;           // Description of the action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
  entityType?: string;       // Type of entity the action was performed on (e.g., 'Worker', 'Barracks')
  entityId?: string | number;// ID of the entity affected
  details?: string;          // Additional details or context about the log entry
  newValue?: any;          // State of the entity after the action (for UPDATE/CREATE)
  oldValue?: any;          // State of the entity before the action (for UPDATE/DELETE)
  ipAddress?: string;        // IP address from which the action originated (if applicable)
  status?: 'Success' | 'Failure'; // Status of the action
  errorMessage?: string;     // Error message if the action failed

  // A generic state field might not be typical for logs unless it represents processing state
  // state?: boolean; 
}
