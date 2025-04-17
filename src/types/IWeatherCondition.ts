import { Document } from  'mongoose';

export interface IWeatherCondition extends document {
  idOrder: number,
  description: string,
  state: boolean
}
