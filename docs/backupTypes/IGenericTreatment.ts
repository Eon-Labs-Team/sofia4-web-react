import { document } from './document';

export interface IGenericTreatment extends document {
  name: string,
  assignedFieldsId: Array<string>,
  state: boolean
}
