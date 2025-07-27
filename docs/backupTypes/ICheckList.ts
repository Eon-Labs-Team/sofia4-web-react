import { document } from './document';

export interface ICheckList extends document {
  checkName:string,
  checkListOf: string,
  state: boolean
}
