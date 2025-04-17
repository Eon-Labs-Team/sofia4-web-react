import { Document } from  'mongoose';

export interface IWasteType extends document {
  idOrder: number,
  description: string,
  order: number,
  state: boolean
}
