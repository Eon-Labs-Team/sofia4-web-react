import { document } from './document';

export interface IPressureUnit extends document {
  code: string,
  description: string,
  state: boolean
}
