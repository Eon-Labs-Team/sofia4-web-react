import { document } from './document';

export interface IWeatherCondition extends document {
  idOrder: number,
  description: string,
  state: boolean
}
