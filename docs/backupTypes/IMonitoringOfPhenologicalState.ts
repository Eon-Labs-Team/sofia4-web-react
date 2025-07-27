import { document } from './document';

export interface IMonitoringOfPhenologicalState extends document {
  date: string,
  crop: string,
  barracks: string,
  phenologicalState: string,
  observation: string,
  exist: boolean,
  image1: string,
  image2: string,
  image3: string,
  state: boolean,
  enterpriseId: number,
}
