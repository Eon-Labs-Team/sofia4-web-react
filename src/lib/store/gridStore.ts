import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for column configuration
export interface Column {
  id: string;
  header: string;
  accessor: string;
  visible: boolean;
  sortable?: boolean;
  groupable?: boolean;
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

// Types for grid state
export interface GridState {
  columns: Column[];
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
}

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
              columns: initialColumns,
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
              columns,
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
                columns: grid.columns.map((col) =>
                  col.id === columnId ? { ...col, visible: !col.visible } : col
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
              columns: initialColumns,
            },
          },
        }));
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
  
  // Return grid state and actions specific to this grid
  return {
    grid,
    initializeGrid,
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