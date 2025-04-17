import { Document } from  'mongoose';

export interface IWarehouseList extends document {
  idOrder: number,
  warehouseName: string,
  location: string,
  code?: string,
  enterpriseCode?: string,
  state: boolean
}
