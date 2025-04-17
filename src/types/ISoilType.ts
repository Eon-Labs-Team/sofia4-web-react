import { document } from './document';

export interface ISoilType extends document {
  idOrder: number,
  description: string,
  state: boolean
}
