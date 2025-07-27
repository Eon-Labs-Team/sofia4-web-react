import { document } from './document';

export interface ITemperatureUnit extends document {
  code: string,
  description: string,
  state: boolean
}
