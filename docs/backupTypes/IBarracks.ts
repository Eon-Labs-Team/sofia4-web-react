import { document } from './document';

export interface IBarracks extends document {
  barracks: string,
  species: string,
  variety: string,
  phenologicalState: string,
  state: boolean
}
