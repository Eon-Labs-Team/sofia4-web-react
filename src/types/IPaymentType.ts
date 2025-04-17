import { document } from './document';

export interface IPaymentType extends document {
  paymentType: string,
  state: boolean
}
