import { Document } from  'mongoose';

export interface IWindCondition extends document {
  idOrder: number,
  description: string,
  state: boolean
}
