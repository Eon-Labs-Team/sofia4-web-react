import { document } from './document';

export interface IContractTemplate extends document {
  description: string,
  contractType: string,
  isActive: boolean,
  predetermined: boolean,
  form: string,
  state: boolean
}
