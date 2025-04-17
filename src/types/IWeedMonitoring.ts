import { document } from './document';

export interface IWeedMonitoring extends document {
  date: string,
  barracks: string,
  crop: string,
  variety: string,
  sector: string,
  weedType: string,
  developmentLevel: number,
  responsible: string,
  observation: string,
  image1: string,
  image2: string,
  image3:string,
  state: boolean
}
