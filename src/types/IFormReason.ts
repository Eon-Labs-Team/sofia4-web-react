import { document } from './document';

export interface IFormReason extends document {
  idOrder: number,
  description: string,
  state: boolean
}
