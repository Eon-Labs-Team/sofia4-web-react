import { document } from './document';

export interface IPaymentMethod extends document {
  paymentMethod: string,
  state: boolean
}
