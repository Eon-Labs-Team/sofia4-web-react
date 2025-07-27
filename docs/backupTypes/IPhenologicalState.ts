import { document } from './document';

export interface  IPhenologicalState extends Document{
  phenologicalState: string,
  color: string,
  sowingDays: number,
  monitoring: boolean,
  image: string,
  orderNumber: number,
  state: boolean
}
