import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface SelectableGridColumn {
  id: string;
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SelectableGridProps {
  columns: SelectableGridColumn[];
  data: any[];
  value?: any[];
  onChange: (selectedRows: any[]) => void;
  multiSelect?: boolean;
  maxHeight?: number;
  searchable?: boolean;
}

const SelectableGrid: React.FC<SelectableGridProps> = ({
  columns,
  data,
  value = [],
  onChange,
  multiSelect = true,
  maxHeight = 300,
  searchable = true,
}) => {
  const [selectedRows, setSelectedRows] = useState<any[]>(value || []);
  const [searchTerm, setSearchTerm] = useState("");

  // Update internal state when external value changes
  useEffect(() => {
    setSelectedRows(value || []);
  }, [value]);

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((row) =>
        columns.some((column) => {
          const cellValue = row[column.accessor];
          return (
            cellValue &&
            String(cellValue).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }),
      )
    : data;

  // Check if a row is selected
  const isRowSelected = (row: any) => {
    return selectedRows.some((selectedRow) => selectedRow.id === row.id);
  };

  // Handle row selection
  const handleRowSelect = (row: any, checked: boolean) => {
    let newSelectedRows: any[];

    if (checked) {
      if (multiSelect) {
        newSelectedRows = [...selectedRows, row];
      } else {
        newSelectedRows = [row];
      }
    } else {
      newSelectedRows = selectedRows.filter(
        (selectedRow) => selectedRow.id !== row.id,
      );
    }

    setSelectedRows(newSelectedRows);
    onChange(newSelectedRows);
  };

  return (
    <div className="w-full border rounded-md">
      {searchable && (
        <div className="p-2 border-b relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}
      <ScrollArea
        className={`w-full ${maxHeight ? `max-h-[${maxHeight}px]` : ""}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={isRowSelected(row)}
                      onCheckedChange={(checked) =>
                        handleRowSelect(row, checked as boolean)
                      }
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      onClick={() => handleRowSelect(row, !isRowSelected(row))}
                    >
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : row[column.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-2 border-t text-sm text-muted-foreground">
        {selectedRows.length} {selectedRows.length === 1 ? "row" : "rows"}{" "}
        selected
      </div>
    </div>
  );
};

export default SelectableGrid;
