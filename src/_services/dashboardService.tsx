import { ENDPOINTS } from '@/lib/constants';
import authService from './authService';
import workerService from './workerService';
import machineryService from './machineryService';
import inventoryProductService from './inventoryProductService';
import inventoryWarehouseService from './inventoryWarehouseService';
import inventoryMovementService from './inventoryMovementService';
import workService from './workService';

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

interface DashboardData {
  stats: DashboardStats;
  workerActivities: WorkerActivity[];
  productConsumptions: ProductConsumption[];
  machineryUsage: MachineryUsage[];
}

/**
 * Service for fetching dashboard statistics and data
 */
class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardData> {
    try {
      // Fetch all required data in parallel
      const [
        workers,
        machinery,
        products,
        works,
        inventoryMovements
      ] = await Promise.all([
        this.fetchWorkerStats(),
        this.fetchMachineryStats(),
        this.fetchProductStats(),
        this.fetchTaskStats(),
        this.fetchInventoryMovements()
      ]);

      // Combine all stats
      const stats: DashboardStats = {
        totalWorkers: workers.total,
        activeWorkers: workers.active,
        totalMachinery: machinery.total,
        activeMachinery: machinery.active,
        totalProducts: products.total,
        lowStockProducts: products.lowStock,
        todayTasks: works.today,
        completedTasks: works.completed,
        pendingTasks: works.pending
      };

      // Generate activity data
      const workerActivities = await this.getWorkerActivities(works.recentWorks);
      const productConsumptions = await this.getProductConsumptions(inventoryMovements);
      const machineryUsage = await this.getMachineryUsage(works.recentWorks);

      return {
        stats,
        workerActivities,
        productConsumptions,
        machineryUsage
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Fetch worker statistics
   */
  private async fetchWorkerStats() {
    try {
      const workers = await workerService.findAll();
      const total = workers.length;
      
      // Get recent works to determine active workers
      const recentWorks = await this.getRecentWorks();
      const activeWorkerIds = new Set();
      
      recentWorks.forEach(work => {
        if (work.workers && Array.isArray(work.workers)) {
          work.workers.forEach((worker: any) => {
            if (worker.worker?._id || worker.worker) {
              activeWorkerIds.add(worker.worker?._id || worker.worker);
            }
          });
        }
      });

      return {
        total,
        active: activeWorkerIds.size
      };
    } catch (error) {
      console.error('Error fetching worker stats:', error);
      return { total: 0, active: 0 };
    }
  }

  /**
   * Fetch machinery statistics
   */
  private async fetchMachineryStats() {
    try {
      const machinery = await machineryService.findAll();
      const total = machinery.length;
      
      // Get recent works to determine active machinery
      const recentWorks = await this.getRecentWorks();
      const activeMachineryIds = new Set();
      
      recentWorks.forEach(work => {
        if (work.machinery && Array.isArray(work.machinery)) {
          work.machinery.forEach((machine: any) => {
            if (machine.machinery?._id || machine.machinery) {
              activeMachineryIds.add(machine.machinery?._id || machine.machinery);
            }
          });
        }
      });

      return {
        total,
        active: activeMachineryIds.size
      };
    } catch (error) {
      console.error('Error fetching machinery stats:', error);
      return { total: 0, active: 0 };
    }
  }

  /**
   * Fetch product statistics
   */
  private async fetchProductStats() {
    try {
      const products = await inventoryProductService.findAll();
      const total = products.length;
      
      // Check stock levels for low stock products
      let lowStock = 0;
      for (const product of products) {
        try {
          // Get active lots for this product across all properties
          const response = await fetch(ENDPOINTS.inventoryLot.byProductId(product._id), {
            headers: authService.getAuthHeaders(),
          });
          
          if (response.ok) {
            const lots = await response.json();
            const lotsData = lots.data || lots || [];
            const totalStock = lotsData.reduce((sum: number, lot: any) => sum + (lot.quantity || 0), 0);
            
            // Consider low stock if less than minimum threshold
            const minThreshold = (product as any).minStock || 10;
            if (totalStock < minThreshold) {
              lowStock++;
            }
          }
        } catch (error) {
          // Continue with other products if one fails
        }
      }

      return {
        total,
        lowStock
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return { total: 0, lowStock: 0 };
    }
  }

  /**
   * Fetch task statistics
   */
  private async fetchTaskStats() {
    try {
      const works = await workService.findAll();
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      const todayWorks = works.filter(work => {
        const workDate = new Date(work.createdAt);
        const workDateString = workDate.toISOString().split('T')[0];
        return workDateString === todayString;
      });

      const completedWorks = todayWorks.filter(work => work.workState === 'confirmed');

      return {
        today: todayWorks.length,
        completed: completedWorks.length,
        pending: todayWorks.length - completedWorks.length,
        recentWorks: works.slice(0, 50) // Get recent works for other calculations
      };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { today: 0, completed: 0, pending: 0, recentWorks: [] };
    }
  }

  /**
   * Fetch inventory movements
   */
  private async fetchInventoryMovements() {
    try {
      const movements = await inventoryMovementService.findAll();
      return movements.slice(0, 100); // Get recent movements
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return [];
    }
  }

  /**
   * Get recent works for activity calculations
   */
  private async getRecentWorks() {
    try {
      const works = await workService.findAll();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return works.filter(work => {
        const workDate = new Date(work.createdAt);
        return workDate >= thirtyDaysAgo;
      });
    } catch (error) {
      console.error('Error fetching recent works:', error);
      return [];
    }
  }

  /**
   * Generate worker activity data from recent works
   */
  private async getWorkerActivities(recentWorks: any[]): Promise<WorkerActivity[]> {
    try {
      const workerStats = new Map();
      const workers = await workerService.findAll();
      
      recentWorks.forEach(work => {
        if (work.workers && Array.isArray(work.workers)) {
          work.workers.forEach((workerData: any) => {
            const workerId = workerData.worker?._id || workerData.worker;
            const workerName = workerData.worker?.name || workerData.worker?.firstName || 'Trabajador';
            
            if (workerId) {
              if (!workerStats.has(workerId)) {
                workerStats.set(workerId, {
                  workerId,
                  workerName,
                  tasksCount: 0,
                  lastActivity: work.date || work.createdAt,
                  propertyName: work.property?.propertyName || 'Sin especificar'
                });
              }
              
              const stats = workerStats.get(workerId);
              stats.tasksCount++;
              
              // Update last activity if this work is more recent
              const currentLastActivity = new Date(stats.lastActivity);
              const workDate = new Date(work.date || work.createdAt);
              if (workDate > currentLastActivity) {
                stats.lastActivity = work.date || work.createdAt;
                stats.propertyName = work.property?.propertyName || 'Sin especificar';
              }
            }
          });
        }
      });

      // Convert to array and sort by task count
      const activities = Array.from(workerStats.values())
        .sort((a, b) => b.tasksCount - a.tasksCount)
        .slice(0, 10) // Top 10 most active workers
        .map(activity => ({
          ...activity,
          lastActivity: this.formatDate(activity.lastActivity)
        }));

      return activities;
    } catch (error) {
      console.error('Error generating worker activities:', error);
      return [];
    }
  }

  /**
   * Generate product consumption data from inventory movements
   */
  private async getProductConsumptions(movements: any[]): Promise<ProductConsumption[]> {
    try {
      const consumptionStats = new Map();
      const products = await inventoryProductService.findAll();
      const productMap = new Map(products.map(p => [p._id, p]));
      
      // Filter consumption movements (negative quantities)
      const consumptions = movements.filter(movement => 
        movement.movementType === 'consumption' || movement.quantity < 0
      );

      consumptions.forEach(movement => {
        const productId = movement.product?._id || movement.productId;
        const product = productMap.get(productId);
        
        if (product) {
          const productName = product.name || 'Producto sin nombre';
          const quantity = Math.abs(movement.quantity || 0);
          
          if (!consumptionStats.has(productId)) {
            consumptionStats.set(productId, {
              productName,
              totalConsumed: 0,
              unit: product.unit || 'unidades',
              lastUsed: movement.createdAt
            });
          }
          
          const stats = consumptionStats.get(productId);
          stats.totalConsumed += quantity;
          
          // Update last used date if more recent
          const currentLastUsed = new Date(stats.lastUsed);
          const movementDate = new Date(movement.createdAt);
          if (movementDate > currentLastUsed) {
            stats.lastUsed = movement.createdAt;
          }
        }
      });

      // Convert to array and sort by consumption
      const consumptionData = Array.from(consumptionStats.values())
        .sort((a, b) => b.totalConsumed - a.totalConsumed)
        .slice(0, 10) // Top 10 most consumed products
        .map(consumption => ({
          ...consumption,
          lastUsed: this.formatDate(consumption.lastUsed)
        }));

      return consumptionData;
    } catch (error) {
      console.error('Error generating product consumptions:', error);
      return [];
    }
  }

  /**
   * Generate machinery usage data from recent works
   */
  private async getMachineryUsage(recentWorks: any[]): Promise<MachineryUsage[]> {
    try {
      const machineryStats = new Map();
      const machinery = await machineryService.findAll();
      
      recentWorks.forEach(work => {
        if (work.machinery && Array.isArray(work.machinery)) {
          work.machinery.forEach((machineData: any) => {
            const machineryId = machineData.machinery?._id || machineData.machinery;
            const machineryName = machineData.machinery?.name || machineData.machinery?.machineryName || 'Maquinaria';
            const hours = machineData.hours || machineData.totalHours || 1;
            
            if (machineryId) {
              if (!machineryStats.has(machineryId)) {
                machineryStats.set(machineryId, {
                  machineryName,
                  totalHours: 0,
                  lastUsed: work.date || work.createdAt,
                  propertyName: work.property?.propertyName || 'Sin especificar'
                });
              }
              
              const stats = machineryStats.get(machineryId);
              stats.totalHours += hours;
              
              // Update last used if this work is more recent
              const currentLastUsed = new Date(stats.lastUsed);
              const workDate = new Date(work.date || work.createdAt);
              if (workDate > currentLastUsed) {
                stats.lastUsed = work.date || work.createdAt;
                stats.propertyName = work.property?.propertyName || 'Sin especificar';
              }
            }
          });
        }
      });

      // Convert to array and sort by total hours
      const usageData = Array.from(machineryStats.values())
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 10) // Top 10 most used machinery
        .map(usage => ({
          ...usage,
          lastUsed: this.formatDate(usage.lastUsed)
        }));

      return usageData;
    } catch (error) {
      console.error('Error generating machinery usage:', error);
      return [];
    }
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Ayer';
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
    } catch (error) {
      return 'Fecha no disponible';
    }
  }
}

// Create a singleton instance
const dashboardService = new DashboardService();

export default dashboardService;