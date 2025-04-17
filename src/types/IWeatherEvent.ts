import { document } from './document';

export interface IWeatherEvent extends document {
  eventDate: string,
  temperature: number,
  temperatureUnit: string,
  damp: number,
  precipitation: number,
  windSpeed:number,
  sunRadiation: number,
  others: string,
  state: boolean
} 
