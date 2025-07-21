import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for persistable column configuration (without render functions)
export interface ColumnConfig {
  id: string;
  header: string;
  accessor: string;
  visible: boolean;
  sortable?: boolean;
  groupable?: boolean;
}

// Types for complete column configuration (includes render functions)
export interface Column extends ColumnConfig {
  render?: (value: any, row: any) => React.ReactNode;
}

// Types for sort state
export interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

// Types for group state
export interface GroupState {
  column: string | null;
}

// Types for grid state (only persistable data)
export interface GridState {
  columnConfigs: ColumnConfig[];  // Only persistable column configs
  sortState: SortState;
  groupState: GroupState;
  searchTerm: string;
  expandedRows: string[];
}

// Interface for the store itself
interface GridStore {
  // A map of grid IDs to their respective states
  grids: Record<string, GridState>;
  
  // Methods for manipulating the state
  initializeGrid: (gridId: string, initialColumns: Column[]) => void;
  setColumns: (gridId: string, columns: Column[]) => void;
  toggleColumnVisibility: (gridId: string, columnId: string) => void;
  setSortState: (gridId: string, sortState: SortState) => void;
  setGroupState: (gridId: string, groupState: GroupState) => void;
  setSearchTerm: (gridId: string, searchTerm: string) => void;
  toggleRowExpanded: (gridId: string, rowId: string | number) => void;
  isRowExpanded: (gridId: string, rowId: string | number) => boolean;
  resetColumnConfiguration: (gridId: string, initialColumns: Column[]) => void;
  // New method to get merged columns
  getMergedColumns: (gridId: string, initialColumns: Column[]) => Column[];
}

// Helper function to extract persistable config from column
const extractColumnConfig = (column: Column): ColumnConfig => ({
  id: column.id,
  header: column.header,
  accessor: column.accessor,
  visible: column.visible,
  sortable: column.sortable,
  groupable: column.groupable,
});

// Helper function to merge persisted config with render functions from code
const mergeColumnConfigs = (
  persistedConfigs: ColumnConfig[],
  initialColumns: Column[]
): Column[] => {
  // Create a map of initial columns for quick lookup
  const initialColumnsMap = new Map(
    initialColumns.map(col => [col.id, col])
  );

  // For each persisted config, merge with initial column data
  return persistedConfigs.map(config => {
    const initialColumn = initialColumnsMap.get(config.id);
    
    if (!initialColumn) {
      // If column doesn't exist in initial config, return just the config
      return config;
    }

    // Merge: use persisted config for persistable properties,
    // but always use render function from initial column
    return {
      ...config,           // Persistable properties from localStorage
      render: initialColumn.render  // Render function from code
    };
  });
};

// Create the Zustand store with persistence
export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => ({
      grids: {},
      
      initializeGrid: (gridId, initialColumns) => {
        const currentStore = get();
        
        // If grid already exists in store, don't overwrite it
        if (currentStore.grids[gridId]) return;
        
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              columnConfigs: initialColumns.map(extractColumnConfig),
              sortState: { column: null, direction: null },
              groupState: { column: null },
              searchTerm: '',
              expandedRows: [],
            },
          },
        }));
      },
      
      setColumns: (gridId, columns) => {
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              ...state.grids[gridId],
              columnConfigs: columns.map(extractColumnConfig),
            },
          },
        }));
      },
      
      toggleColumnVisibility: (gridId, columnId) => {
        set((state) => {
          const grid = state.grids[gridId];
          if (!grid) return state;
          
          return {
            grids: {
              ...state.grids,
              [gridId]: {
                ...grid,
                columnConfigs: grid.columnConfigs.map((config) =>
                  config.id === columnId ? { ...config, visible: !config.visible } : config
                ),
              },
            },
          };
        });
      },
      
      setSortState: (gridId, sortState) => {
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              ...state.grids[gridId],
              sortState,
            },
          },
        }));
      },
      
      setGroupState: (gridId, groupState) => {
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              ...state.grids[gridId],
              groupState,
            },
          },
        }));
      },
      
      setSearchTerm: (gridId, searchTerm) => {
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              ...state.grids[gridId],
              searchTerm,
            },
          },
        }));
      },
      
      toggleRowExpanded: (gridId, rowId) => {
        set((state) => {
          const grid = state.grids[gridId];
          if (!grid) return state;
          
          const rowIdStr = String(rowId);
          const expandedRows = [...grid.expandedRows];
          const index = expandedRows.indexOf(rowIdStr);
          
          if (index >= 0) {
            expandedRows.splice(index, 1);
          } else {
            expandedRows.push(rowIdStr);
          }
          
          return {
            grids: {
              ...state.grids,
              [gridId]: {
                ...grid,
                expandedRows,
              },
            },
          };
        });
      },
      
      isRowExpanded: (gridId, rowId) => {
        const store = get();
        const grid = store.grids[gridId];
        if (!grid) return false;
        
        return grid.expandedRows.includes(String(rowId));
      },
      
      resetColumnConfiguration: (gridId, initialColumns) => {
        set((state) => ({
          grids: {
            ...state.grids,
            [gridId]: {
              ...state.grids[gridId],
              columnConfigs: initialColumns.map(extractColumnConfig),
            },
          },
        }));
      },

      // New method to get properly merged columns
      getMergedColumns: (gridId, initialColumns) => {
        const store = get();
        const grid = store.grids[gridId];
        
        if (!grid || !grid.columnConfigs) {
          return initialColumns;
        }
        
        return mergeColumnConfigs(grid.columnConfigs, initialColumns);
      },
    }),
    {
      name: 'grid-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper hooks for easier use within components
export const useGrid = (gridId: string) => {
  const gridStore = useGridStore();
  const grid = gridStore.grids[gridId];
  
  // Initialize grid if it doesn't exist
  const initializeGrid = (initialColumns: Column[]) => {
    gridStore.initializeGrid(gridId, initialColumns);
  };
  
  // Get merged columns (persisted config + render functions from code)
  const getMergedColumns = (initialColumns: Column[]) => {
    return gridStore.getMergedColumns(gridId, initialColumns);
  };
  
  // Return grid state and actions specific to this grid
  return {
    grid,
    initializeGrid,
    getMergedColumns,
    setColumns: (columns: Column[]) => gridStore.setColumns(gridId, columns),
    toggleColumnVisibility: (columnId: string) => gridStore.toggleColumnVisibility(gridId, columnId),
    setSortState: (sortState: SortState) => gridStore.setSortState(gridId, sortState),
    setGroupState: (groupState: GroupState) => gridStore.setGroupState(gridId, groupState),
    setSearchTerm: (searchTerm: string) => gridStore.setSearchTerm(gridId, searchTerm),
    toggleRowExpanded: (rowId: string | number) => gridStore.toggleRowExpanded(gridId, rowId),
    isRowExpanded: (rowId: string | number) => gridStore.isRowExpanded(gridId, rowId),
    resetColumnConfiguration: (initialColumns: Column[]) => gridStore.resetColumnConfiguration(gridId, initialColumns),
  };
}; 