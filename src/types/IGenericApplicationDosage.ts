import { document } from './document';

export interface IGenericApplicationDosage extends document {
  assignedFieldsId: Array<string>,
  genericUse: string,
  withdrawalDays: number,
  reentryHours: number,
  minDose: number,
  maxDose?: number,
  state: boolean
}
