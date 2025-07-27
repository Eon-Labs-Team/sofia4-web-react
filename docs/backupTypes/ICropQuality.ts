import { document } from './document';

export interface ICropQuality extends document {
  idOrder: number,
  description: string,
  shortName?: string,
  state: boolean
}
