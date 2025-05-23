import { document } from './document';


export interface IMachinery extends Document {
workId: string;
  machinery: string;
  startTime: string;
  endTime: string;
  finalHours: string;
  timeValue: string;
  totalValue: string;
  createdBy?: string;
  updatedBy?: string;
} 
