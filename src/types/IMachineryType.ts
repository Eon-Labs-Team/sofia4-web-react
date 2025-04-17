import { Document } from  'mongoose';

export interface IMachineryType extends document {
  idOrder:number,
  description:string,
  order: number,
  state: boolean
}
