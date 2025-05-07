import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipo para un ítem de menú
export interface NavItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: NavItem[];
  isExpanded?: boolean;
  requiredRole?: string;
}

// Interfaz para el estado del store
interface SidebarState {
  // Estado original del menú para poder restaurarlo
  originalNavItems: NavItem[];
  // Si estamos en un modo específico (ej: visualizando un cuartel)
  actionMode: boolean;
  // Datos del modo actual si estamos en uno
  activeAction: {
    actionId: string;
    propertyId: string | number;
    title?: string;
    subtitle?: string;
  } | null;

  // Acciones para manipular el estado
  saveOriginalNavItems: (items: NavItem[]) => void;
  restoreOriginalNavItems: () => void;
  toggleActionMode: (active: boolean) => void;
  setActiveAction: (action: SidebarState['activeAction']) => void;
  resetActiveAction: () => void;
}

// Crear el store con Zustand
export const useSidebarStore = create<SidebarState>()(
  // Usamos persist para mantener el estado entre recargas de página
  persist(
    (set) => ({
      originalNavItems: [],
      actionMode: false,
      activeAction: null,
      
      saveOriginalNavItems: (items) => set({ originalNavItems: items }),
      
      restoreOriginalNavItems: () => 
        set((state) => ({ 
          actionMode: false,
          activeAction: null
        })),
      
      toggleActionMode: (active) => set({ actionMode: active }),
      
      setActiveAction: (action) => set({ activeAction: action }),
      
      resetActiveAction: () => set({ 
        activeAction: null,
        actionMode: false
      }),
    }),
    {
      name: 'sidebar-storage', // nombre para localStorage
      partialize: (state) => ({
        // Solo persistimos estos valores
        actionMode: state.actionMode,
        activeAction: state.activeAction,
      }),
    }
  )
); 