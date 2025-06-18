import { document } from './document';

export interface IWarehouseLot extends document {
  productId: string;
  batchNumber: string;
  lotNumber: string;
  warehouseId: string;
  quantity: number;
  productionDate: string;
  expiryDate: string;
  supplier: string;
  cost: number;
  status: boolean;
  isDeleted: boolean;
  state: boolean;
} 