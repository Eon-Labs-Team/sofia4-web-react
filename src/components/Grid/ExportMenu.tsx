import React from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  data: any[];
  columns: any[];
  filename?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  data,
  columns,
  filename = "exported-data",
}) => {
  // Función para exportar a CSV
  const exportToCSV = () => {
    // Obtener solo las columnas visibles
    const visibleColumns = columns.filter((col) => col.visible);

    // Crear encabezados
    const headers = visibleColumns.map((col) => col.header);

    // Crear filas de datos
    const rows = data.map((item) =>
      visibleColumns.map((col) => {
        const value = item[col.accessor];
        return value !== null && value !== undefined ? String(value) : "";
      }),
    );

    // Combinar encabezados y filas
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar a Excel (simplificada, solo CSV con extensión .xlsx)
  const exportToExcel = () => {
    // Obtener solo las columnas visibles
    const visibleColumns = columns.filter((col) => col.visible);

    // Crear encabezados
    const headers = visibleColumns.map((col) => col.header);

    // Crear filas de datos
    const rows = data.map((item) =>
      visibleColumns.map((col) => {
        const value = item[col.accessor];
        return value !== null && value !== undefined ? String(value) : "";
      }),
    );

    // Combinar encabezados y filas
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar a PDF (simplificada, solo alerta)
  const exportToPDF = () => {
    alert(
      "PDF export functionality would be implemented here with a library like jsPDF",
    );
    // En una implementación real, usaríamos una biblioteca como jsPDF
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Export Data">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <File className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
