import { document } from './document';

export interface IMeasurementUnits extends document {
  type: string,
  optionalCode?: string,
  state: boolean
}
