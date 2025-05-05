import { document } from './document';

//Registro de trabajos realizados.

export interface IWorkers extends document {
  worker: WorkerType, //id del trabajador
  quadrille: string, //id de la cuadrilla
  workingDay: string, //horas trabajadas
  paymentMethod: string, //metodo de pago -- tomado de la entidad work en la cual se está creando. 
  yield: string, //rendimiento
  totalHoursYield: string, //total de horas de rendimiento
  overtime: string, //horas extras
  bonus: string, //bono
  yieldValue: string, //valor del rendimiento -- Traido del valor de la labor (workType)
  dayValue: string, //valor de la jornada

  additionalBonuses: string, // bonos extra 

  exportPerformance: string, //rendimiento exportación
  juicePerformance: string, //rendimiento jugo
  othersPerformance: string, //rendimiento otros

  totalDeal: string, //total trato
  dailyTotal: string, //total diario

  value: string, //valor
  salary: string, //salario -- traido de la ficha del trabajador -- se usa para calcular el valor dia.
  date: string,
  contractor: string,
  state: boolean
}

interface WorkerType {
  id: string,
}
