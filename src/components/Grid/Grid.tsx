import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search,
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

interface GridProps {
  data: any[];
  columns: Column[];
  idField?: string;
  title?: string;
  onRowClick?: (row: any) => void;
  expandableContent?: (row: any) => React.ReactNode;
  gridId: string; // New prop to identify which grid configuration to use
  actions?: (row: any) => React.ReactNode; // New prop for action buttons
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
}) => {
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
    return columns
      .filter((column) => column.visible)
      .map((column) => (
        <td key={column.id} className="px-4 py-2 border-t">
          {column.render
            ? column.render(row[column.accessor], row)
            : row[column.accessor] != null
              ? String(row[column.accessor])
              : ""}
        </td>
      ));
  };

  // Renderizar filas normales (sin agrupar)
  const renderRows = () => {
    console.log(sortedData);
    if (groupState.column) return null;

    return sortedData.map((row, index) => {
      const rowId = row[idField] || `row-${index}`;
      const isExpanded = isRowExpanded(rowId);

      return (
        <React.Fragment key={`row-${rowId}`}>
          <tr
            key={`tr-${rowId}`}
            className={`hover:bg-muted/50 ${onRowClick ? "cursor-pointer" : ""}`}
            onClick={() => onRowClick && onRowClick(row)}
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
            {actions && (
              <td className="px-4 py-2 border-t">
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
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
                  (actions ? 1 : 0)
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
                (actions ? 1 : 0)
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

                return (
                  <React.Fragment key={`row-${rowId}`}>
                    <tr
                      key={`tr-${rowId}`}
                      className={`hover:bg-muted/50 ${onRowClick ? "cursor-pointer" : ""}`}
                      onClick={() => onRowClick && onRowClick(row)}
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
                      {actions && (
                        <td className="px-4 py-2 border-t">
                          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                            {actions(row)}
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
                            (actions ? 1 : 0)
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
              {actions && (
                <th key="actions-column" className="px-4 py-2 w-24">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupState.column ? renderGroupedRows() : renderRows()}
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
