import { Document } from  'mongoose';

export interface INoticeAccount extends document {
  email: string,
  warningType: Array<string>,
  state: boolean
}
