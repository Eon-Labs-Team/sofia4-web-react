import { Document } from  'mongoose';

export interface IMachineryBrand extends document {
  idOrder:number,
  description:string,
  order: number,
  state: boolean
}
