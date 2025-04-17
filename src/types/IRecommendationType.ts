import { Document } from  'mongoose';

export interface IRecommendationType extends document {
  orderId: string,
  description: string,
  state: boolean
}
