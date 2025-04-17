import { document } from './document';

export interface IGlobalConfig extends document {
  applyOn: string,
  name: string,
  description: string,
  value: number,
  type: string,
  state: boolean
}
