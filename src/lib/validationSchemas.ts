import { z } from "zod";

// Esquema de validación para trabajadores
export const workerFormSchema = z.object({
  worker: z.string().min(1, "Debe seleccionar un trabajador"),
  classification: z.string().min(1, "La clasificación es requerida"),
  quadrille: z.string().optional(),
  workingDay: z.string().optional(),
  paymentMethod: z.string().optional(),
  contractor: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  salary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
  yield: z.coerce.number().min(0, "El rendimiento debe ser mayor o igual a 0"),
  totalHoursYield: z.coerce.number().min(0, "Las horas de rendimiento deben ser mayor o igual a 0"),
  yieldValue: z.coerce.number().min(0, "El valor de rendimiento debe ser mayor o igual a 0"),
  overtime: z.coerce.number().min(0, "Las horas extra deben ser mayor o igual a 0"),
  bonus: z.coerce.number().min(0, "El bono debe ser mayor o igual a 0"),
  additionalBonuses: z.coerce.number().min(0, "Los bonos adicionales deben ser mayor o igual a 0"),
  dayValue: z.coerce.number().min(0, "El valor día debe ser mayor o igual a 0"),
  totalDeal: z.coerce.number().min(0, "El total trato debe ser mayor o igual a 0"),
  dailyTotal: z.coerce.number().min(0, "El total diario debe ser mayor o igual a 0"),
  value: z.coerce.number().min(0, "El valor debe ser mayor o igual a 0"),
  exportPerformance: z.coerce.number().min(0, "El rendimiento exportación debe ser mayor o igual a 0"),
  juicePerformance: z.coerce.number().min(0, "El rendimiento jugo debe ser mayor o igual a 0"),
  othersPerformance: z.coerce.number().min(0, "Otros rendimientos deben ser mayor o igual a 0"),
  state: z.boolean().default(true),
  workId: z.string().optional(),
});

// Esquema de validación para maquinaria
export const machineryFormSchema = z.object({
  machinery: z.string().min(1, "El nombre de la maquinaria es requerido"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  finalHours: z.string().optional(),
  timeValue: z.coerce.number().min(0, "El valor tiempo debe ser mayor o igual a 0"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
  workId: z.string().optional(),
});

// Esquema de validación para productos
export const productFormSchema = z.object({
  category: z.string().optional(),
  product: z.string().min(1, "Debe seleccionar un producto"),
  unitOfMeasurement: z.string().min(1, "La unidad de medida es requerida"),
  amountPerHour: z.coerce.number().min(0, "La cantidad por hora debe ser mayor o igual a 0"),
  amount: z.coerce.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  netUnitValue: z.coerce.number().min(0, "El valor unitario neto debe ser mayor o igual a 0"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
  return: z.coerce.number().min(0, "El retorno debe ser mayor o igual a 0"),
  machineryRelationship: z.string().optional(),
  packagingCode: z.string().optional(),
  invoiceNumber: z.string().optional(),
  workId: z.string().optional(),
});

export type WorkerFormData = z.infer<typeof workerFormSchema>;
export type MachineryFormData = z.infer<typeof machineryFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>; 