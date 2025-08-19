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
import dashboardService from "@/_services/dashboardService";
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
  tasksCount: number;
  lastActivity: string;
  propertyName: string;
}

interface ProductConsumption {
  productName: string;
  totalConsumed: number;
  unit: string;
  lastUsed: string;
}

interface MachineryUsage {
  machineryName: string;
  totalHours: number;
  lastUsed: string;
  propertyName: string;
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
  
  const [workerActivities, setWorkerActivities] = useState<WorkerActivity[]>([
    { workerId: "1", workerName: "Juan Pérez", tasksCount: 15, lastActivity: "Hoy", propertyName: "Predio Norte" },
    { workerId: "2", workerName: "María González", tasksCount: 12, lastActivity: "Ayer", propertyName: "Predio Sur" },
    { workerId: "3", workerName: "Carlos Rodríguez", tasksCount: 10, lastActivity: "Hace 2 días", propertyName: "Predio Este" },
  ]);
  
  const [productConsumptions, setProductConsumptions] = useState<ProductConsumption[]>([
    { productName: "Fertilizante NPK", totalConsumed: 450, unit: "kg", lastUsed: "Hoy" },
    { productName: "Pesticida Orgánico", totalConsumed: 125, unit: "L", lastUsed: "Ayer" },
    { productName: "Semillas Híbridas", totalConsumed: 85, unit: "kg", lastUsed: "Hace 3 días" },
  ]);
  
  const [machineryUsage, setMachineryUsage] = useState<MachineryUsage[]>([
    { machineryName: "Tractor John Deere", totalHours: 156, lastUsed: "Hoy", propertyName: "Predio Norte" },
    { machineryName: "Cosechadora Case", totalHours: 89, lastUsed: "Ayer", propertyName: "Predio Sur" },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Using mock data for demonstration
      // In production, uncomment the lines below to use real data
      
      // const dashboardData = await dashboardService.getDashboardStats();
      // setStats(dashboardData.stats);
      // setWorkerActivities(dashboardData.workerActivities);
      // setProductConsumptions(dashboardData.productConsumptions);
      // setMachineryUsage(dashboardData.machineryUsage);
      
      // Mock data is already set in state initialization
      console.log('Dashboard loaded with mock data');
      
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
                    <TableHead>Tareas</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Última Act.</TableHead>
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
                            {activity.tasksCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{activity.propertyName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {activity.lastActivity}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                    <TableHead>Consumido</TableHead>
                    <TableHead>Último Uso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productConsumptions.length > 0 ? (
                    productConsumptions.map((consumption, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {consumption.productName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{consumption.totalConsumed}</span>
                            <span className="text-xs text-muted-foreground">
                              {consumption.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {consumption.lastUsed}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
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
                    <TableHead>Horas Totales</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineryUsage.length > 0 ? (
                    machineryUsage.map((usage, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {usage.machineryName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{usage.totalHours}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{usage.propertyName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {usage.lastUsed}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={usage.totalHours > 0 ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            <Leaf className="h-3 w-3" />
                            {usage.totalHours > 0 ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
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