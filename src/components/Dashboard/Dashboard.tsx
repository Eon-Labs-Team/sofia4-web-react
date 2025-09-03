import React, { useState, useEffect } from "react";
import {
  Users,
  Tractor,
  Package,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Leaf,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import workService from "@/_services/workService";
import type { IWork } from "@eon-lib/eon-mongoose";
import { useAuthStore } from "@/lib/store/authStore";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  totalMachinery: number;
  activeMachinery: number;
  totalProducts: number;
  lowStockProducts: number;
  todayTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface WorkerActivity {
  workerId: string;
  workerName: string;
  worksCount: number;
  totalYield: number;
  totalHours: number;
  totalEarnings: number;
  lastWorkDate: string;
  workTypes: string[];
  efficiency: number;
}

interface ProductConsumption {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalWorks: number;
  avgDosage: number;
  lastUsed: string;
  workTypes: string[];
}

interface MachineryUsage {
  machineryId: string;
  machineryName: string;
  totalWorks: number;
  totalHours: number;
  totalHectares: number;
  avgCalibration: number;
  lastUsed: string;
  workTypes: string[];
  utilizationRate: number;
}

// Mock data for charts
const productivityData = [
  { month: "Ene", trabajadores: 45, tareas: 120, eficiencia: 85 },
  { month: "Feb", trabajadores: 52, tareas: 142, eficiencia: 88 },
  { month: "Mar", trabajadores: 48, tareas: 135, eficiencia: 82 },
  { month: "Abr", trabajadores: 61, tareas: 168, eficiencia: 91 },
  { month: "May", trabajadores: 55, tareas: 155, eficiencia: 87 },
  { month: "Jun", trabajadores: 67, tareas: 185, eficiencia: 89 }
];

const tasksByTypeData = [
  { name: "Aplicación", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Cosecha", value: 28, fill: "hsl(var(--chart-2))" },
  { name: "Trabajo", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Mantenimiento", value: 17, fill: "hsl(var(--chart-4))" }
];

const machineryUsageData = [
  { day: "Lun", horas: 8.5 },
  { day: "Mar", horas: 7.2 },
  { day: "Mié", horas: 9.1 },
  { day: "Jue", horas: 8.8 },
  { day: "Vie", horas: 9.5 },
  { day: "Sab", horas: 6.3 },
  { day: "Dom", horas: 2.1 }
];

const chartConfig = {
  trabajadores: {
    label: "Trabajadores",
    color: "hsl(var(--chart-1))",
  },
  tareas: {
    label: "Tareas",
    color: "hsl(var(--chart-2))",
  },
  eficiencia: {
    label: "Eficiencia %",
    color: "hsl(var(--chart-3))",
  },
  horas: {
    label: "Horas",
    color: "hsl(var(--chart-4))",
  }
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 67,
    activeWorkers: 45,
    totalMachinery: 28,
    activeMachinery: 18,
    totalProducts: 156,
    lowStockProducts: 12,
    todayTasks: 24,
    completedTasks: 18,
    pendingTasks: 6,
  });
  
  const [workerActivities, setWorkerActivities] = useState<WorkerActivity[]>([]);
  
  const [productConsumptions, setProductConsumptions] = useState<ProductConsumption[]>([]);
  
  const [machineryUsage, setMachineryUsage] = useState<MachineryUsage[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Extract worker data from IWork.workers array
  const extractWorkerData = (works: IWork[]): WorkerActivity[] => {
    const workerMap = new Map<string, {
      workerId: string;
      workerName: string;
      worksCount: number;
      totalYield: number;
      totalHours: number;
      totalEarnings: number;
      lastWorkDate: Date;
      workTypes: Set<string>;
    }>();

    works.forEach(work => {
      if (work.workers && Array.isArray(work.workers)) {
        work.workers.forEach(workerData => {
          const workerId = workerData.worker?.id || workerData.worker || 'unknown';
          const workerName = workerData.worker?.name || workerData.worker?.firstName || `Trabajador ${workerId}`;
          
          if (!workerMap.has(workerId)) {
            workerMap.set(workerId, {
              workerId,
              workerName,
              worksCount: 0,
              totalYield: 0,
              totalHours: 0,
              totalEarnings: 0,
              lastWorkDate: new Date(work.executionDate || work.startDate || work.createdAt),
              workTypes: new Set()
            });
          }

          const worker = workerMap.get(workerId)!;
          worker.worksCount += 1;
          worker.totalYield += workerData.yield || 0;
          worker.totalHours += workerData.totalHoursYield || workerData.workingDay || 0;
          worker.totalEarnings += workerData.totalDeal || workerData.dailyTotal || 0;
          worker.workTypes.add(work.workType || 'T');
          
          const workDate = new Date(work.executionDate || work.startDate || work.createdAt);
          if (workDate > worker.lastWorkDate) {
            worker.lastWorkDate = workDate;
          }
        });
      }
    });

    return Array.from(workerMap.values())
      .map(worker => ({
        workerId: worker.workerId,
        workerName: worker.workerName,
        worksCount: worker.worksCount,
        totalYield: worker.totalYield,
        totalHours: worker.totalHours,
        totalEarnings: worker.totalEarnings,
        lastWorkDate: worker.lastWorkDate.toLocaleDateString(),
        workTypes: Array.from(worker.workTypes),
        efficiency: worker.totalYield > 0 ? Math.min(100, Math.round((worker.totalYield / worker.totalHours) * 10)) : 85
      }))
      .sort((a, b) => b.worksCount - a.worksCount)
      .slice(0, 10);
  };

  // Extract machinery data from IWork.machinery array
  const extractMachineryData = (works: IWork[]): MachineryUsage[] => {
    const machineryMap = new Map<string, {
      machineryId: string;
      machineryName: string;
      totalWorks: number;
      totalHours: number;
      totalHectares: number;
      totalCalibration: number;
      calibrationCount: number;
      lastWorkDate: Date;
      workTypes: Set<string>;
    }>();

    works.forEach(work => {
      if (work.machinery && Array.isArray(work.machinery)) {
        work.machinery.forEach(machineData => {
          const machineryId = machineData.machinery?.id || machineData.machinery || 'unknown';
          const machineryName = machineData.machinery?.name || machineData.machinery?.machineryName || `Maquinaria ${machineryId}`;
          
          if (!machineryMap.has(machineryId)) {
            machineryMap.set(machineryId, {
              machineryId,
              machineryName,
              totalWorks: 0,
              totalHours: 0,
              totalHectares: 0,
              totalCalibration: 0,
              calibrationCount: 0,
              lastWorkDate: new Date(work.executionDate || work.startDate || work.createdAt),
              workTypes: new Set()
            });
          }

          const machinery = machineryMap.get(machineryId)!;
          machinery.totalWorks += 1;
          machinery.totalHours += machineData.totalHours || machineData.hours || 1;
          machinery.totalHectares += work.appliedHectares || work.hectares || 0;
          machinery.workTypes.add(work.workType || 'T');
          
          if (work.calibrationPerHectare && work.calibrationPerHectare > 0) {
            machinery.totalCalibration += work.calibrationPerHectare;
            machinery.calibrationCount += 1;
          }
          
          const workDate = new Date(work.executionDate || work.startDate || work.createdAt);
          if (workDate > machinery.lastWorkDate) {
            machinery.lastWorkDate = workDate;
          }
        });
      }
    });

    return Array.from(machineryMap.values())
      .map(machinery => ({
        machineryId: machinery.machineryId,
        machineryName: machinery.machineryName,
        totalWorks: machinery.totalWorks,
        totalHours: machinery.totalHours,
        totalHectares: machinery.totalHectares,
        avgCalibration: machinery.calibrationCount > 0 ? machinery.totalCalibration / machinery.calibrationCount : 0,
        lastUsed: machinery.lastWorkDate.toLocaleDateString(),
        workTypes: Array.from(machinery.workTypes),
        utilizationRate: Math.min(100, Math.round((machinery.totalWorks / 30) * 100)) // Assuming 30 is max works per month
      }))
      .sort((a, b) => b.totalWorks - a.totalWorks)
      .slice(0, 10);
  };

  // Extract product data from IWork.products array
  const extractProductData = (works: IWork[]): ProductConsumption[] => {
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      totalQuantity: number;
      totalWorks: number;
      dosageCount: number;
      totalDosage: number;
      lastWorkDate: Date;
      workTypes: Set<string>;
    }>();

    works.forEach(work => {
      if (work.products && Array.isArray(work.products)) {
        work.products.forEach(productData => {
          const productId = productData.product?.id || productData.product || 'unknown';
          const productName = productData.product?.name || productData.product?.productName || `Producto ${productId}`;
          
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              productId,
              productName,
              totalQuantity: 0,
              totalWorks: 0,
              dosageCount: 0,
              totalDosage: 0,
              lastWorkDate: new Date(work.executionDate || work.startDate || work.createdAt),
              workTypes: new Set()
            });
          }

          const product = productMap.get(productId)!;
          product.totalWorks += 1;
          product.totalQuantity += productData.quantityUsed || productData.quantity || 0;
          product.workTypes.add(work.workType || 'A');
          
          if (productData.dosage && productData.dosage > 0) {
            product.totalDosage += productData.dosage;
            product.dosageCount += 1;
          }
          
          const workDate = new Date(work.executionDate || work.startDate || work.createdAt);
          if (workDate > product.lastWorkDate) {
            product.lastWorkDate = workDate;
          }
        });
      }
    });

    return Array.from(productMap.values())
      .map(product => ({
        productId: product.productId,
        productName: product.productName,
        totalQuantity: product.totalQuantity,
        totalWorks: product.totalWorks,
        avgDosage: product.dosageCount > 0 ? product.totalDosage / product.dosageCount : 0,
        lastUsed: product.lastWorkDate.toLocaleDateString(),
        workTypes: Array.from(product.workTypes)
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get real IWork data
      const works: IWork[] = await workService.findAll();
      console.log('Loaded works:', works.length);

      // Calculate dashboard stats from IWork data
      const today = new Date().toISOString().split('T')[0];
      const todayWorks = works.filter(work => {
        const workDate = new Date(work.executionDate || work.startDate || work.createdAt).toISOString().split('T')[0];
        return workDate === today;
      });

      // Update stats
      const uniqueWorkers = new Set();
      const uniqueMachinery = new Set();
      works.forEach(work => {
        work.workers?.forEach(w => uniqueWorkers.add(w.worker?.id || w.worker));
        work.machinery?.forEach(m => uniqueMachinery.add(m.machinery?.id || m.machinery));
      });

      setStats({
        totalWorkers: uniqueWorkers.size,
        activeWorkers: uniqueWorkers.size,
        totalMachinery: uniqueMachinery.size,
        activeMachinery: uniqueMachinery.size,
        totalProducts: works.reduce((sum, work) => sum + (work.products?.length || 0), 0),
        lowStockProducts: 0,
        todayTasks: todayWorks.length,
        completedTasks: works.filter(w => w.workState === 'confirmed').length,
        pendingTasks: works.filter(w => w.workState === 'pending').length,
      });

      // Extract detailed reports from IWork arrays
      const workerData = extractWorkerData(works);
      const machineryData = extractMachineryData(works);
      const productData = extractProductData(works);

      setWorkerActivities(workerData);
      setMachineryUsage(machineryData);
      setProductConsumptions(productData);

      console.log('Dashboard loaded with IWork data:', {
        workers: workerData.length,
        machinery: machineryData.length,
        products: productData.length
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const workerEfficiency = stats.totalWorkers > 0 ? Math.round((stats.activeWorkers / stats.totalWorkers) * 100) : 0;
  const machineryEfficiency = stats.totalMachinery > 0 ? Math.round((stats.activeMachinery / stats.totalMachinery) * 100) : 0;
  const taskCompletion = stats.todayTasks > 0 ? Math.round((stats.completedTasks / stats.todayTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Operaciones</h2>
          <p className="text-muted-foreground">
            Resumen de actividades y métricas generales del sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actualizado: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkers} / {stats.totalWorkers}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {workerEfficiency >= 70 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span>{workerEfficiency}% activos</span>
            </div>
          </CardContent>
        </Card>

        {/* Machinery Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maquinaria</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMachinery} / {stats.totalMachinery}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {machineryEfficiency >= 60 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span>{machineryEfficiency}% en uso</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {stats.lowStockProducts > 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-green-500" />
              )}
              <span>{stats.lowStockProducts} stock bajo</span>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks} / {stats.todayTasks}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {taskCompletion >= 80 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-orange-500" />
              )}
              <span>{taskCompletion}% completadas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Productividad Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="tareas"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="trabajadores"
                  stackId="2"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tasks by Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribución de Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={tasksByTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tasksByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Machinery Usage Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5" />
              Uso de Maquinaria (Semana Actual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={machineryUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="horas"
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Trabajadores Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead>Rendimiento</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Tipos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerActivities.length > 0 ? (
                    workerActivities.map((activity) => (
                      <TableRow key={activity.workerId}>
                        <TableCell className="font-medium">
                          {activity.workerName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {activity.worksCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">{activity.totalYield.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{activity.totalHours.toFixed(1)}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {activity.workTypes.map(type => (
                              <Badge key={type} variant={type === 'A' ? 'default' : type === 'C' ? 'secondary' : 'outline'} className="text-xs">
                                {type === 'A' ? 'Apl' : type === 'C' ? 'Cos' : 'Tra'}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay datos de actividad disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Product Consumption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos Más Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad Total</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead>Dosis Prom.</TableHead>
                    <TableHead>Tipos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productConsumptions.length > 0 ? (
                    productConsumptions.map((consumption, index) => (
                      <TableRow key={consumption.productId || index}>
                        <TableCell className="font-medium">
                          {consumption.productName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-green-500" />
                            <span>{consumption.totalQuantity.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {consumption.totalWorks}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {consumption.avgDosage > 0 ? `${consumption.avgDosage.toFixed(2)} L/Ha` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {consumption.workTypes.map(type => (
                              <Badge key={type} variant={type === 'A' ? 'default' : 'outline'} className="text-xs">
                                {type === 'A' ? 'Apl' : type === 'C' ? 'Cos' : 'Tra'}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay datos de consumo disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Machinery Usage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5" />
              Uso de Maquinaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maquinaria</TableHead>
                    <TableHead>Trabajos</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Hectáreas</TableHead>
                    <TableHead>Calibración</TableHead>
                    <TableHead>Tipos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineryUsage.length > 0 ? (
                    machineryUsage.map((usage, index) => (
                      <TableRow key={usage.machineryId || index}>
                        <TableCell className="font-medium">
                          {usage.machineryName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {usage.totalWorks}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{usage.totalHours.toFixed(1)}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Leaf className="h-3 w-3 text-green-500" />
                            <span>{usage.totalHectares.toFixed(1)} Ha</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {usage.avgCalibration > 0 ? `${usage.avgCalibration.toFixed(1)} L/Ha` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {usage.workTypes.map(type => (
                              <Badge key={type} variant={type === 'A' ? 'default' : type === 'C' ? 'secondary' : 'outline'} className="text-xs">
                                {type === 'A' ? 'Apl' : type === 'C' ? 'Cos' : 'Tra'}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay datos de uso de maquinaria disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;