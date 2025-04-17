import { document } from './document';

export interface IWarehouse extends document {
  warehouse: string,
  productHouse: string,
  productType: string,
  productName: string,
  activeIngredient: string,
  treatmentReason: string,
  category: string,
  subCategory: string,
  unitMeasure: string,
  unitStock: string,
  lackDays: number,
  reentryHours: number,
  classCost: string,
  subClassCost: string,
  warehouseState: string,
  location: string,
  netValue: number,
  task: number,
  totalPrice: number,
  state: boolean
}
