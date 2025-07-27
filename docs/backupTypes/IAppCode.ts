import { document } from './document';

export interface IAppCode extends document {
  appCode: string,
  entryDate: string,
  entryHour: string,
  technicalServiceDate: string,
  userDestiny: string,
  requestState: boolean,
  remainingDays: string,
  state: boolean
}
