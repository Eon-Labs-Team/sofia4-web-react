import { document } from './document';

export interface IProductCategory extends document {
  idOrder: number,
  description: string,
  subCategory: string,
  numberSubCategory: number,
  state: boolean
}
