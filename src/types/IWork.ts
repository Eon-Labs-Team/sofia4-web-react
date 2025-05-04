import { Document } from 'mongoose';

//interfaz realizada a partir de la entidad aplicacion de productos

type WorkState = 'confirmed' | 'pending' | 'void' | 'blocked';
type WorkType = 'C' | 'A' | 'T';

export interface IWork extends Document {

  workType : WorkType, // Tipo de faena ( C = COSECHA, A = APLICACION DE PRODUCTOS, T = TRABAJO AGRICOLA).

  id: string,
  orderNumber: string, // Numero de orden custom
  executionDate: string, // Fecha de ejecucion
  barracks: string, // Cuartel / Potrero
  species: string, // Especie / cultivo
  variety: string, // Variedad del cultivo
  phenologicalState: string, // Estado fenologico
  hectares: number, // Total de Hectareas ( Dado por el cuartel ) no modificable
  appliedHectares: number, // Hectareas aplicadas ( Dado por el usuario ) modificable
  coverage: number, // cobertura del cultivo -- Desmanche - entre hilera - sobre hilera - total
  generalObjective: string, // Objetivo general
  observation: string, // Observacion
  observationApp: string, // Observacion desde la app sofia
  workState: WorkState, // Estado de la faena  // Confirmada - pendiente - nula - bloqueada
  syncApp: boolean, // Para descargar en app sofia.
  appUser: string, // usuario de la app sofia al que se le asigno el trabajo o faena.

  startDate: string, // Fecha de inicio de la faena
  hourStartDate: string, // Hora de inicio de la faena
  endDate: string, // Fecha de fin de la faena
  hourEndDate: string, // Hora de fin de la faena 

  gracePeriodEndDate: string, // fecha de termino de la carencia
  reEntryDate: string, // Fecha de reingreso
  reEntryHour: string, // Hora de reingreso

  climateConditions: string, // Condiciones climaticas
  windSpeed: string, // Condiciones del viento
  temperature: string, // Condiciones de temperatura
  humidity: string, // Condiciones de humedad


  // Datos de la faena
  rowNumber: RowNumberType,
  dosification: string, // Dosificacion
  taskType: string,
  task: Task,
  customTask?: string,
  calibrationPerHectare: number,


  taskOptimalYield: number,
  initialBonusToWorkers: number,
  paymentMethodToWorkers: string,
  taskPrice: number, // lo preselecciona desde el task

  responsibles?: ResponsibleType,
  ppe?: PersonalProtectionEquipment;
  washing?: WashingProtocol;


  //maestros de detalle
  workers: Array<WorkWorkers>,
  machinery: Array<WorkMachinery>,
  products: Array<WorkProducts>,
  documents: Array<WorkDocuments>,

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

interface RowNumberType {
  id: string,
}

interface Task {
  id: string,
  optionalCode: string,
  taskName: string,
  taskPrice: number,
  optimalYield: number,
  isEditableInApp: boolean,
  usesWetCalculationPerHa: boolean,
  usageContext: string, // 0: solo web, 1: solo app, 2: web y app
  maxHarvestYield: number,
  showTotalEarningsInApp: boolean,
  associatedProducts: Array<AssociatedProductsType>,
  requiresRowCount: boolean,
  requiresHourLog: boolean
}

interface PersonalProtectionEquipment {
  gloves: boolean;
  applicatorSuit: boolean;
  respirator: boolean;
  faceShield: boolean;
  apron: boolean;
  boots: boolean;
  noseMouthProtector: boolean;
  others?: string; // Campo de texto libre
}

interface WashingProtocol {
  suit1: boolean;
  suit2: boolean;
  suit3: boolean;
  filterHolder1: boolean;
  filterHolder2: boolean;
  filterHolder3: boolean;
  tripleWash: boolean;
  machinery: boolean;
  leftovers: boolean;
  leftoverObservation: boolean;
}

interface AssociatedProductsType {
  product: ProductType,
  quantityPerHectare: string,
}

interface ProductType {
  id: string,
}

interface MachineryType {
  id: string,
}

interface UserRole {
  userId: string;
  name?: string;
}

interface ResponsibleType {
  supervisor: UserRole;
  planner: UserRole;
  technicalVerifier: UserRole;
  applicators: UserRole[];
}

interface WorkWorkers {
  classification: string,
  worker: WorkerType,
  quadrille: string,
  workingDay: string,
  paymentMethod: string,
  totalHectares: string
  overtime: string,
  bond: string,
  dayValue: string,
  totalDeal: string,
  bonuses: string,
  exportPerformance: string,
  juicePerformance: string,
  othersPerformance: string,
  dailyTotal: string,
  value: string,
  salary: string,
  date: string,
  contractor: string,
}

interface WorkerType {
  id: string,
}

interface WorkMachinery {
  classification: string,
  machinery: MachineryType,
  startTime: string,
  endTime: string,
  finalHours: string,
  timeValue: string,
  totalValue: string,
}

interface WorkProducts {
  category: string,
  product: string,
  unitOfMeasurement: string,
  amountPerHour: string,
  amount: string,
  netUnitValue: string,
  totalValue: string,
  return: string,
  machineryRelationship: MachineryRelationshipType,
  packagingCode: string,
  invoiceNumber: string,
}

interface WorkDocuments {
  id: string,
  documentType: string,
  documentNumber: string,
  documentDate: string,
  source: string,
}


interface MachineryRelationshipType {
  id: string,
}
