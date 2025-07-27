import { document } from './document';

export interface ISubRecommendationType extends document {
  orderId: string,
  description: string,
  state: boolean
}
