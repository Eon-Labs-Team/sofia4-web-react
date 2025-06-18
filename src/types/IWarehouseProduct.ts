import { document } from './document';

export interface IWarehouseProduct extends document {
  name: string;
  description: string;
  category: string;
  structureType: string;
  unit: string;
  price: number;
  minStock: number;
  maxStock: number;
  status: string;
  state: boolean;
} 