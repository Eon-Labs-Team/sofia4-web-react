import { Document} from "mongoose";

export interface IClassifyWorker extends document {
  idOrder: number,
  description: string,
  order: number,
  machineryOperator: boolean,
  state: boolean
}
