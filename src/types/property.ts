export interface Property {
  _id?: string;
  // General Property Data
  propertyType: string;
  country: string;
  propertyName: string;
  internalAuthorizationCode: string;
  orderPrefix: string;
  taxId: string;
  businessName: string;
  legalRepresentative: string;
  address: string;
  city: string;
  district: string;
  region: string;
  businessActivity: string;
  email: string;
  phone: string;
  plantedArea: number;
  totalArea: number;
  climateViewerLocation: string;
  status: boolean;

  // Geographic Location
  latDegrees: number;
  latMinutes: number;
  latSeconds: number;
  latDirection: 'N' | 'S';
  longDegrees: number;
  longMinutes: number;
  longSeconds: number;
  longDirection: 'E' | 'W' | 'O';
  latitude: number;
  longitude: number;
  altitude: number;

  // Registration Records
  realEstateRegistration: string;
  roleNumber: string;
  pagesYears: string;
  waterRights: string;
  propertySpeciesList: string;

  // BPA Manager
  administrator: string;
  administratorEmail: string;
  administratorPhone: string;
  bpaManager: string;
  bpaManagerEmail: string;
  bpaManagerPhone: string;

  enterpriseId: string;
  isDeleted: boolean;
} 