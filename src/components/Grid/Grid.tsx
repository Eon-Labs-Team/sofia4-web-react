import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search,
  Edit,
  Save,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column, useGrid } from "@/lib/store/gridStore";
import ColumnConfiguration from "./ColumnConfiguration";
import ExportMenu from "./ExportMenu";
import GroupingMenu from "./GroupingMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GridProps {
  data: any[];
  columns: Column[];
  idField?: string;
  title?: string;
  onRowClick?: (row: any) => void;
  expandableContent?: (row: any) => React.ReactNode;
  gridId: string; // New prop to identify which grid configuration to use
  actions?: (row: any) => React.ReactNode; // New prop for action buttons
  // Inline editing props
  enableInlineEdit?: boolean; // Flag to enable inline editing
  onEditStart?: (row: any) => void; // Callback when edit mode starts
  onEditSave?: (row: any, updatedRow: any) => Promise<void>; // Callback to save changes
  onEditCancel?: (row: any) => void; // Callback when edit is cancelled
  editableColumns?: string[]; // Array of column ids that are editable
  customEditRender?: { [columnId: string]: (value: any, onChange: (value: any) => void, options?: any) => React.ReactNode }; // Custom edit renderers for specific columns
  // Inline add props
  enableInlineAdd?: boolean; // Flag to enable inline adding
  onInlineAdd?: (newRow: any) => Promise<void>; // Callback to save new row
  defaultNewRow?: any; // Default values for new row
  addableColumns?: string[]; // Array of column ids that are addable (if different from editable)
  customAddRender?: { [columnId: string]: (value: any, onChange: (value: any) => void, options?: any) => React.ReactNode }; // Custom add renderers for specific columns
}

const GridComponent: React.FC<GridProps> = ({
  data,
  columns: initialColumns,
  idField = "id",
  title = "Data Grid",
  onRowClick,
  expandableContent,
  gridId,
  actions,
  enableInlineEdit = false,
  onEditStart,
  onEditSave,
  onEditCancel,
  editableColumns = [],
  customEditRender = {},
  enableInlineAdd = false,
  onInlineAdd,
  defaultNewRow = {},
  addableColumns = [],
  customAddRender = {},
}) => {
  // State for inline editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>(null);
  const [editingSaving, setEditingSaving] = useState(false);

  // State for inline adding
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowData, setNewRowData] = useState<any>(null);
  const [addingSaving, setAddingSaving] = useState(false);

  // Get grid state from Zustand
  const {
    grid,
    initializeGrid,
    setSortState,
    setGroupState,
    setSearchTerm,
    toggleRowExpanded,
    isRowExpanded,
  } = useGrid(gridId);

  // Initialize grid if not already initialized
  useEffect(() => {
    initializeGrid(initialColumns);
  }, [initialColumns, initializeGrid]);

  // Always define these, even when grid is null
  const columns = grid?.columns || initialColumns;
  const sortState = grid?.sortState || { column: null, direction: null };
  const groupState = grid?.groupState || { column: null };
  const searchTerm = grid?.searchTerm || "";

  // Functions for inline editing
  const startEditing = (row: any) => {
    const rowId = row[idField];
    setEditingRowId(String(rowId));
    setEditingRowData({ ...row });
    onEditStart?.(row);
  };

  const cancelEditing = () => {
    if (editingRowData) {
      onEditCancel?.(editingRowData);
    }
    setEditingRowId(null);
    setEditingRowData(null);
  };

  const saveEditing = async () => {
    if (!editingRowData || !onEditSave) return;
    
    setEditingSaving(true);
    try {
      await onEditSave(data.find(row => String(row[idField]) === editingRowId), editingRowData);
      setEditingRowId(null);
      setEditingRowData(null);
    } catch (error) {
      console.error('Error saving edit:', error);
    } finally {
      setEditingSaving(false);
    }
  };

  const updateEditingRowData = (columnAccessor: string, value: any) => {
    if (!editingRowData) return;
    
    // Handle nested property access (e.g., "worker.id")
    const keys = columnAccessor.split('.');
    const updatedData = { ...editingRowData };
    
    if (keys.length > 1) {
      let current = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedData[columnAccessor] = value;
    }
    
    setEditingRowData(updatedData);
  };

  const renderEditableCell = (column: Column, row: any) => {
    const rowId = String(row[idField]);
    const isEditing = rowId === editingRowId;
    const isColumnEditable = editableColumns.includes(column.id);
    
    if (!isEditing || !isColumnEditable) {
      // Return normal cell content for this specific row
      return column.render
        ? column.render(row[column.accessor], row)
        : row[column.accessor] != null
          ? String(row[column.accessor])
          : "";
    }

    // Only use editing data if this specific row is being edited
    if (!editingRowData) {
      return row[column.accessor] != null ? String(row[column.accessor]) : "";
    }

    // Get value from editing data, handling nested properties
    const getValue = (accessor: string, data: any) => {
      const keys = accessor.split('.');
      let value = data;
      for (const key of keys) {
        value = value?.[key];
      }
      return value;
    };

    const currentValue = getValue(column.accessor, editingRowData);

    // Check if there's a custom edit renderer for this column
    if (customEditRender[column.id]) {
      return customEditRender[column.id](
        currentValue,
        (value) => updateEditingRowData(column.accessor, value)
      );
    }

    // Default input renderer
    return (
      <Input
        value={currentValue || ""}
        onChange={(e) => updateEditingRowData(column.accessor, e.target.value)}
        className="h-8 text-xs"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  const renderNewRowCell = (column: Column) => {
    const isColumnAddable = addableColumns.length > 0 
      ? addableColumns.includes(column.id) 
      : editableColumns.includes(column.id);
    
    // Debug logs
    console.log(`Column ${column.id} (${column.header}):`, {
      isColumnAddable,
      columnId: column.id,
      addableColumns,
      editableColumns,
      newRowData
    });
    
    if (!isColumnAddable) {
      return ""; // Empty cell for non-addable columns
    }

    // Get value from new row data, handling nested properties
    const getValue = (accessor: string, data: any) => {
      const keys = accessor.split('.');
      let value = data;
      for (const key of keys) {
        value = value?.[key];
      }
      return value;
    };

    const currentValue = getValue(column.accessor, newRowData);

    // Check if there's a custom add renderer for this column, fallback to edit renderer
    const customRenderer = customAddRender[column.id] || customEditRender[column.id];
    if (customRenderer) {
      return customRenderer(
        currentValue,
        (value) => updateNewRowData(column.accessor, value)
      );
    }

    // Default input renderer
    return (
      <Input
        value={currentValue || ""}
        onChange={(e) => updateNewRowData(column.accessor, e.target.value)}
        className="h-8 text-xs"
        placeholder={`Nuevo ${column.header.toLowerCase()}`}
      />
    );
  };

  // Filtrar datos basados en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    if (!columns) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.visible) return false;
        const value = row[column.accessor];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortState?.column || !sortState?.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valueA = a[sortState.column as string];
      const valueB = b[sortState.column as string];

      if (valueA === valueB) return 0;

      const direction = sortState.direction === "asc" ? 1 : -1;

      if (valueA == null) return 1 * direction;
      if (valueB == null) return -1 * direction;

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * direction;
      }

      return (valueA > valueB ? 1 : -1) * direction;
    });
  }, [filteredData, sortState]);

  // Agrupar datos
  const groupedData = useMemo(() => {
    if (!groupState?.column) return sortedData;

    const groups: Record<string, any[]> = {};

    sortedData.forEach((row) => {
      const groupValue = row[groupState.column as string];
      const groupKey = groupValue != null ? String(groupValue) : "Undefined";

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(row);
    });

    return groups;
  }, [sortedData, groupState]);

  // Early return if grid is not initialized yet
  if (!grid) return <div>Loading...</div>;

  // Manejar clic en encabezado de columna para ordenar
  const handleSort = (columnId: string) => {
    if (sortState.column === columnId) {
      // Ciclo: asc -> desc -> null
      if (sortState.direction === "asc") {
        setSortState({ column: columnId, direction: "desc" });
      } else if (sortState.direction === "desc") {
        setSortState({ column: null, direction: null });
      } else {
        setSortState({ column: columnId, direction: "asc" });
      }
    } else {
      // Nueva columna, comenzar con asc
      setSortState({ column: columnId, direction: "asc" });
    }
  };

  // Renderizar encabezados de columna
  const renderHeaders = () => {
    return columns
      .filter((column) => column.visible)
      .map((column) => (
        <th
          key={column.id}
          className={`px-4 py-2 text-left font-medium text-sm ${column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}`}
          onClick={() => column.sortable && handleSort(column.accessor)}
        >
          <div className="flex items-center">
            {column.header}
            {sortState.column === column.accessor && (
              <span className="ml-1">
                {sortState.direction === "asc" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        </th>
      ));
  };

  // Renderizar celdas de una fila
  const renderCells = (row: any) => {
    const rowId = row[idField] || 'unknown-row';
    return columns
      .filter((column) => column.visible)
      .map((column) => (
        <td key={`${rowId}-${column.id}`} className="px-4 py-2 border-t">
          {renderEditableCell(column, row)}
        </td>
      ));
  };

  // Render edit action buttons for inline editing
  const renderEditActions = (row: any) => {
    const rowId = String(row[idField]);
    const isEditing = rowId === editingRowId;

    if (!enableInlineEdit) return null;

    if (isEditing) {
      return (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              saveEditing();
            }}
            disabled={editingSaving}
            title="Guardar"
            className="h-7 w-7"
          >
            <Save className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              cancelEditing();
            }}
            disabled={editingSaving}
            title="Cancelar"
            className="h-7 w-7"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          startEditing(row);
        }}
        title="Editar"
        className="h-7 w-7"
      >
        <Edit className="h-3 w-3" />
      </Button>
    );
  };

  // Functions for inline adding
  const startAdding = () => {
    // Don't allow adding while editing
    if (editingRowId) return;
    
    setIsAddingNewRow(true);
    setNewRowData({ ...defaultNewRow });
  };

  const cancelAdding = () => {
    setIsAddingNewRow(false);
    setNewRowData(null);
  };

  const saveAdding = async () => {
    if (!newRowData || !onInlineAdd) return;
    
    setAddingSaving(true);
    try {
      await onInlineAdd(newRowData);
      setIsAddingNewRow(false);
      setNewRowData(null);
    } catch (error) {
      console.error('Error saving new row:', error);
    } finally {
      setAddingSaving(false);
    }
  };

  const updateNewRowData = (columnAccessor: string, value: any) => {
    if (!newRowData) return;
    
    // Handle nested property access (e.g., "worker.id")
    const keys = columnAccessor.split('.');
    const updatedData = { ...newRowData };
    
    if (keys.length > 1) {
      let current = updatedData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedData[columnAccessor] = value;
    }
    
    setNewRowData(updatedData);
  };

  // Render add action buttons for inline adding
  const renderAddActions = () => {
    if (!enableInlineAdd || !isAddingNewRow) return null;

    return (
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            saveAdding();
          }}
          disabled={addingSaving}
          title="Guardar nuevo registro"
          className="h-7 w-7"
        >
          <Save className="h-3 w-3 text-green-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            cancelAdding();
          }}
          disabled={addingSaving}
          title="Cancelar nuevo registro"
          className="h-7 w-7"
        >
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  };

  // Render the new row for adding
  const renderNewRow = () => {
    if (!isAddingNewRow) return null;

    return (
      <tr key="new-row" className="bg-green-50 border-2 border-green-200">
        {expandableContent && (
          <td className="px-4 py-2 border-t w-10"></td>
        )}
        {columns
          .filter((column) => column.visible)
          .map((column) => (
            <td key={`new-${column.id}`} className="px-4 py-2 border-t">
              {renderNewRowCell(column)}
            </td>
          ))}
        {(actions || enableInlineEdit || enableInlineAdd) && (
          <td className="px-4 py-2 border-t">
            <div className="flex justify-end items-center space-x-1">
              {renderAddActions()}
            </div>
          </td>
        )}
      </tr>
    );
  };

  // Renderizar filas normales (sin agrupar)
  const renderRows = () => {
    console.log(sortedData);
    if (groupState.column) return null;

    return sortedData.map((row, index) => {
      const rowId = row[idField] || `row-${index}`;
      const isExpanded = isRowExpanded(rowId);
      const isEditing = String(rowId) === editingRowId;

      return (
        <React.Fragment key={`row-${rowId}`}>
          <tr
            key={`tr-${rowId}`}
            className={`hover:bg-muted/50 ${onRowClick && !isEditing ? "cursor-pointer" : ""} ${isEditing ? "bg-blue-50" : ""}`}
            onClick={() => !isEditing && onRowClick && onRowClick(row)}
          >
            {expandableContent && (
              <td className="px-4 py-2 border-t w-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpanded(rowId);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </td>
            )}
            {renderCells(row)}
            {(actions || enableInlineEdit || enableInlineAdd) && (
              <td className="px-4 py-2 border-t">
                <div className="flex justify-end items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  {enableInlineEdit && renderEditActions(row)}
                  {actions && actions(row)}
                </div>
              </td>
            )}
          </tr>
          {expandableContent && isExpanded && (
            <tr key={`expanded-${rowId}`}>
              <td
                colSpan={
                  columns.filter((col) => col.visible).length +
                  (expandableContent ? 1 : 0) +
                  (actions || enableInlineEdit || enableInlineAdd ? 1 : 0)
                }
                className="bg-muted/20 p-4"
              >
                {expandableContent(row)}
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  };

  // Renderizar filas agrupadas
  const renderGroupedRows = () => {
    if (!groupState.column) return null;

    return Object.entries(groupedData).map(([groupName, rows], groupIndex) => {
      const groupId = `group-${groupName}-${groupIndex}`;
      const isExpanded = isRowExpanded(groupId);

      return (
        <React.Fragment key={groupId}>
          <tr key={`group-tr-${groupId}`} className="bg-muted/30">
            <td
              colSpan={
                columns.filter((col) => col.visible).length +
                (expandableContent ? 1 : 0) +
                (actions || enableInlineEdit || enableInlineAdd ? 1 : 0)
              }
              className="px-4 py-2 font-medium"
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleRowExpanded(groupId)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <span>
                  {
                    columns.find((col) => col.accessor === groupState.column)
                      ?.header
                  }
                  : {groupName} ({rows.length} items)
                </span>
              </div>
            </td>
          </tr>
          {isExpanded && (
            <>
              {rows.map((row, rowIndex) => {
                const rowId = row[idField] || `row-in-group-${groupIndex}-${rowIndex}`;
                const rowExpanded = isRowExpanded(rowId);
                const isEditing = String(rowId) === editingRowId;

                return (
                  <React.Fragment key={`row-${rowId}`}>
                    <tr
                      key={`tr-${rowId}`}
                      className={`hover:bg-muted/50 ${onRowClick && !isEditing ? "cursor-pointer" : ""} ${isEditing ? "bg-blue-50" : ""}`}
                      onClick={() => !isEditing && onRowClick && onRowClick(row)}
                    >
                      {expandableContent && (
                        <td className="px-4 py-2 border-t w-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpanded(rowId);
                            }}
                          >
                            {rowExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      )}
                      {renderCells(row)}
                      {(actions || enableInlineEdit || enableInlineAdd) && (
                        <td className="px-4 py-2 border-t">
                          <div className="flex justify-end items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            {enableInlineEdit && renderEditActions(row)}
                            {actions && actions(row)}
                          </div>
                        </td>
                      )}
                    </tr>
                    {expandableContent && rowExpanded && (
                      <tr key={`expanded-${rowId}`}>
                        <td
                          colSpan={
                            columns.filter((col) => col.visible).length +
                            (expandableContent ? 1 : 0) +
                            (actions || enableInlineEdit || enableInlineAdd ? 1 : 0)
                          }
                          className="bg-muted/20 p-4"
                        >
                          {expandableContent(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </React.Fragment>
      );
    });
  };

  // Render the toolbar
  const renderToolbar = () => {
    return (
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-[250px] h-9 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {enableInlineAdd && (
            <Button
              onClick={startAdding}
              disabled={isAddingNewRow || editingRowId !== null}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <GroupingMenu columns={columns} gridId={gridId} />
          <ExportMenu 
            data={filteredData} 
            columns={columns} 
            filename={title.replace(/\s+/g, "-").toLowerCase()} 
          />
          <ColumnConfiguration columns={columns} gridId={gridId} />
        </div>
      </div>
    );
  };

  // Return the Grid UI
  return (
    <div className="bg-background border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        {renderToolbar()}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {expandableContent && (
                <th key="expand-column" className="px-4 py-2 w-10"></th>
              )}
              {renderHeaders()}
              {(actions || enableInlineEdit || enableInlineAdd) && (
                <th key="actions-column" className="px-4 py-2 w-24">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupState.column ? renderGroupedRows() : renderRows()}
            {renderNewRow()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Grid: React.FC<GridProps> = (props) => {
  return <GridComponent {...props} />;
};

export default Grid;
