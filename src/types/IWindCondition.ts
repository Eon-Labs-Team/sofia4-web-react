import { document } from './document';

export interface IWindCondition extends document {
  idOrder: number,
  description: string,
  state: boolean
}
