import { document } from './document';

export interface IContractType extends document {
  idOrder: number,
  description: string,
  order: number,
  state: boolean
}
