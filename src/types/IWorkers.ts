import { document } from './document';

//Registro de trabajos realizados.

export interface IWorkers extends document {
  worker: string, //id del trabajador
  quadrille: string, //id de la cuadrilla
  workingDay: string, //horas trabajadas
  paymentMethod: string, //metodo de pago -- tomado de la entidad work en la cual se está creando. 
  yield: string, //rendimiento
  totalHoursYield: string, //total de horas de rendimiento
  overtime: string, //horas extras
  bonus: string, //bono
  bond: string, //alias for bonus
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
  classification: string, // clasificación del trabajador
  workId: string, // ID de la orden de trabajo asociada
  state: boolean,
  id: string, // ID del registro
  createdBy: string | null, // ID del usuario que creó el registro
  updatedBy: string | null, // ID del usuario que actualizó el registro
}

