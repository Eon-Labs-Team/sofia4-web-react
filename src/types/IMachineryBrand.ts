import { document } from './document';

export interface IMachineryBrand extends document {
  idOrder:number,
  description:string,
  order: number,
  state: boolean
}
