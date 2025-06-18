import { document } from './document';

export interface IInventoryMovement extends document {
  productId: string;
  lotId: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  date: string;
  reference: string;
  notes: string;
  unitCost: number;
  movementDate: string;
  state: boolean;
} 