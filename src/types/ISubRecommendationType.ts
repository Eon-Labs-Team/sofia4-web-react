import { Document } from  'mongoose';

export interface ISubRecommendationType extends document {
  orderId: string,
  description: string,
  state: boolean
}
