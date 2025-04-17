import { Document } from "mongoose";

export interface IMassBalance extends document {
  period: string,
  harvestFormat: string,
  packagingFormat: string,
  plants: number,
  hectares:number,
  state: boolean
}
