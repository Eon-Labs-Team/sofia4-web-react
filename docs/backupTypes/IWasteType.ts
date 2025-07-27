import { document } from './document';

export interface IWasteType extends document {
  idOrder: number,
  description: string,
  order: number,
  state: boolean
}
