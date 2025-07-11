import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column, useGrid } from "@/lib/store/gridStore";
import ColumnConfiguration from "./ColumnConfiguration";
import ExportMenu from "./ExportMenu";
import GroupingMenu from "./GroupingMenu";
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
  gridId: string;
  actions?: (row: any) => React.ReactNode;
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((column) => {
          const value = row[column.accessor];
          return value != null &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortState.column && sortState.direction) {
      result.sort((a, b) => {
        const aValue = a[sortState.column!];
        const bValue = b[sortState.column!];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortState.direction === "asc" ? -1 : 1;
        if (bValue == null) return sortState.direction === "asc" ? 1 : -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortState.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortState.direction === "asc") {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return result;
  }, [data, searchTerm, sortState, columns]);

  // Group data if grouping is enabled
  const groupedData = useMemo(() => {
    if (!groupState.column) return null;

    const groups = filteredAndSortedData.reduce((acc, row) => {
      const groupValue = row[groupState.column!] || "Sin agrupar";
      if (!acc[groupValue]) {
        acc[groupValue] = [];
      }
      acc[groupValue].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(groups).map(([groupValue, rows]) => ({
      groupValue,
      rows,
    }));
  }, [filteredAndSortedData, groupState]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return (groupedData || filteredAndSortedData).slice(startIndex, endIndex);
  }, [filteredAndSortedData, groupedData, currentPage, pageSize]);

  const totalPages = Math.ceil((groupedData || filteredAndSortedData).length / pageSize);

  const handleSort = (columnId: string) => {
    const currentDirection = sortState.column === columnId ? sortState.direction : null;
    let newDirection: "asc" | "desc" | null = "asc";
    
    if (currentDirection === "asc") {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = null;
    }

    setSortState({ column: newDirection ? columnId : null, direction: newDirection });
  };

  const renderHeaders = () => {
    const visibleColumns = columns.filter((col) => col.visible);
    
    return (
      <tr className="border-b">
        {expandableContent && (
          <th className="px-4 py-3 w-8"></th>
        )}
        {visibleColumns.map((column) => (
          <th
            key={column.id}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
            onClick={() => column.sortable && handleSort(column.accessor)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp
                    className={`h-3 w-3 ${
                      sortState.column === column.accessor && sortState.direction === "asc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <ChevronDown
                    className={`h-3 w-3 -mt-1 ${
                      sortState.column === column.accessor && sortState.direction === "desc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        {actions && (
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        )}
      </tr>
    );
  };

  const renderCells = (row: any) => {
    const visibleColumns = columns.filter((col) => col.visible);
    
    return visibleColumns.map((column) => (
      <td key={column.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
        {column.render
          ? column.render(row[column.accessor], row)
          : row[column.accessor] != null
            ? String(row[column.accessor])
            : ""}
      </td>
    ));
  };

  const renderRows = () => {
    if (!paginatedData || paginatedData.length === 0) {
      return (
        <tr>
          <td
            colSpan={
              columns.filter((col) => col.visible).length +
              (expandableContent ? 1 : 0) +
              (actions ? 1 : 0)
            }
            className="px-4 py-8 text-center text-gray-500"
          >
            No hay datos para mostrar
          </td>
        </tr>
      );
    }

    if (groupedData) {
      return renderGroupedRows();
    }

    return paginatedData.map((row, index) => {
      const rowId = String(row[idField]);
      const isExpanded = expandableContent && isRowExpanded(rowId);
      
      return (
        <React.Fragment key={rowId}>
          <tr
            className="border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick && onRowClick(row)}
          >
            {expandableContent && (
              <td className="px-4 py-3 w-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRowExpanded(rowId);
                  }}
                  className="h-6 w-6"
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
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {actions(row)}
              </td>
            )}
          </tr>
          {isExpanded && expandableContent && (
            <tr>
              <td
                colSpan={
                  columns.filter((col) => col.visible).length +
                  (expandableContent ? 1 : 0) +
                  (actions ? 1 : 0)
                }
                className="p-0"
              >
                <div className="bg-gray-50 border-l-4 border-blue-500">
                  {expandableContent(row)}
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  };

  const renderGroupedRows = () => {
    return paginatedData.map((group: any) => (
      <React.Fragment key={group.groupValue}>
        <tr className="bg-gray-100 border-b">
          <td
            colSpan={
              columns.filter((col) => col.visible).length +
              (expandableContent ? 1 : 0) +
              (actions ? 1 : 0)
            }
            className="px-4 py-2 font-semibold text-gray-700"
          >
            {group.groupValue} ({group.rows.length} elementos)
          </td>
        </tr>
        {group.rows.map((row: any) => {
          const rowId = String(row[idField]);
          const isExpanded = expandableContent && isRowExpanded(rowId);
          
          return (
            <React.Fragment key={rowId}>
              <tr
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {expandableContent && (
                  <td className="px-4 py-3 w-8">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpanded(rowId);
                      }}
                      className="h-6 w-6"
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {actions(row)}
                  </td>
                )}
              </tr>
              {isExpanded && expandableContent && (
                <tr>
                  <td
                    colSpan={
                      columns.filter((col) => col.visible).length +
                      (expandableContent ? 1 : 0) +
                      (actions ? 1 : 0)
                    }
                    className="p-0"
                  >
                    <div className="bg-gray-50 border-l-4 border-blue-500">
                      {expandableContent(row)}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    ));
  };

  const renderToolbar = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <GroupingMenu
            columns={columns.filter((col) => col.groupable)}
            gridId={gridId}
          />
        </div>

        <div className="flex space-x-2">
          <ColumnConfiguration
            columns={columns}
            gridId={gridId}
          />
          <ExportMenu data={filteredAndSortedData} columns={columns} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}

      {renderToolbar()}

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              {renderHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderRows()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedData.length)} a{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)} de{" "}
            {filteredAndSortedData.length} resultados
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Filas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-700 px-2">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Grid: React.FC<GridProps> = (props) => {
  return <GridComponent {...props} />;
};

export default Grid