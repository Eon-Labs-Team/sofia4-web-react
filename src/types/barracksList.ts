/**
 * Interfaz de ListaCuarteles alineada con el modelo de Mongoose IBarracksList
 */
export interface BarracksList {
  _id?: string | number;  // Campo automático generado por la base de datos
  classificationZone: string;
  barracksPaddockName: string;
  codeOptional: string;
  organic: boolean;
  varietySpecies: string;
  variety: string;
  qualityType: string;
  totalHa: number;
  totalPlants: number;
  percentToRepresent: number;
  availableRecord: string;
  active: boolean;
  useProration: boolean;

  firstHarvestDate: string;
  firstHarvestDay: number;
  secondHarvestDate: string;
  secondHarvestDay: number;
  thirdHarvestDate: string;
  thirdHarvestDay: number;

  soilType: string;
  texture: string;
  depth: string;
  soilPh: number;
  percentPending: number;

  pattern: string;
  plantationYear: number;
  plantNumber: number;
  rowsList: string;
  plantForRow: number;
  distanceBetweenRowsMts: number;
  rowsTotal: number;
  area: number;

  irrigationType: string;
  itsByHa: number;
  irrigationZone: boolean;

  barracksLotObject: string;
  investmentNumber: string;
  observation: string;
  mapSectorColor: string;
  state: boolean;

  createdAt?: Date;  // Campos automáticos de timestamps
  updatedAt?: Date;  // Campos automáticos de timestamps
} 