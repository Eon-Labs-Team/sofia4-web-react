import { document } from './document';

export interface IRecommendationType extends document {
  orderId: string,
  description: string,
  state: boolean
}
