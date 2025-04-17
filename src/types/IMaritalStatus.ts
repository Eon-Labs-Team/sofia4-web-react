import { document } from './document';

export interface IMaritalStatus extends document {
  idOrder: number,
  description: string,
  order: number,
  state: boolean
}
