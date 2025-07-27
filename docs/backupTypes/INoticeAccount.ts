import { document } from './document';

export interface INoticeAccount extends document {
  email: string,
  warningType: Array<string>,
  state: boolean
}
