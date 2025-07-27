import { document } from './document';

//Registro de trabajos realizados.


export enum PaymentMethod {
  TRATO = "trato",
  TRATO_DIA = "trato-dia",
  DIA_LABORAL = "dia-laboral",
  MAYOR_TRATO_DIA = "mayor-trato-dia",
  TRATO_DIA_LABORAL = "trato-dia-laboral"
}

export interface IWorkers extends document {
  worker: string, //id del trabajador
  quadrille: string, //id de la cuadrilla
  workingDay: string, //horas trabajadas
  paymentMethod: PaymentMethod, //metodo de pago -- tomado de la entidad work en la cual se está creando. 
  yield: number, //rendimiento
  totalHoursYield: number, //total de horas de rendimiento
  overtime: number, //horas extras
  bonus: number, //bono
  bond: string, //alias for bonus
  yieldValue: number, //valor del rendimiento -- Traido del valor de la labor (workType)
  dayValue: number, //valor de la jornada

  additionalBonuses: number, // bonos extra 

  exportPerformance: number, //rendimiento exportación
  juicePerformance: number, //rendimiento jugo
  othersPerformance: number, //rendimiento otros

  totalDeal: number, //total trato
  dailyTotal: number, //total diario

  value: number, //valor
  salary: number, //salario -- traido de la ficha del trabajador -- se usa para calcular el valor dia.
  date: string,
  contractor: string,
  classification: string, // clasificación del trabajador
  workId: string, // ID de la orden de trabajo asociada
  state: boolean,
  id: string, // ID del registro
  createdBy: string | null, // ID del usuario que creó el registro
  updatedBy: string | null, // ID del usuario que actualizó el registro
}

