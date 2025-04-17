import { document } from './document';

export interface IChlorination extends document {
  date: string,
  site: string,
  supervisor: string,
  frequency: string,
  observations: string,
  name: string,
  signature: string,
  state: boolean
}
