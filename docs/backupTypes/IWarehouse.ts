import { document } from './document';

export interface IWarehouse extends document {
  name: string;
  enterpriseId: string;
  fieldId: string;
  status: boolean;
  isDeleted: boolean;
  location: {
    name: string;
    capacity?: number;
  }
}
