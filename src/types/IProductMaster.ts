import { document } from './document';

export interface IProductMaster extends document {
  fieldId: string,
  name: string,
  location: {
    name: string,
  },
  state: boolean
}
