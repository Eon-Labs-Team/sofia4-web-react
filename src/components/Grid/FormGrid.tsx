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
  Plus,
  AlertCircle
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { FormGridRules, FieldRulesEngine } from "@/lib/validationSchemas";

interface FormGridProps {
  data: any[];
  columns: Column[];
  idField?: string;
  title?: string;
  onRowClick?: (row: any) => void;
  expandableContent?: (row: any) => React.ReactNode;
  gridId: string;
  actions?: (row: any) => React.ReactNode;
  // Form validation props
  editValidationSchema?: z.ZodSchema<any>;
  addValidationSchema?: z.ZodSchema<any>;
  // Inline editing props
  enableInlineEdit?: boolean;
  onEditStart?: (row: any) => void;
  onEditSave?: (originalRow: any, updatedRow: any) => Promise<void>;
  onEditCancel?: (row: any) => void;
  editableColumns?: string[];
  customEditRender?: { [columnId: string]: (control: any, field: any, formState: any) => React.ReactNode };
  // Inline add props
  enableInlineAdd?: boolean;
  onInlineAdd?: (newRow: any) => Promise<void>;
  defaultNewRow?: any;
  addableColumns?: string[];
  customAddRender?: { [columnId: string]: (control: any, field: any, formState: any) => React.ReactNode };
  // Field configurations
  fieldConfigurations?: {
    [columnId: string]: {
      type?: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'date' | 'time' | 'datetime-local';
      placeholder?: string;
      options?: { value: string; label: string }[];
      min?: number;
      max?: number;
      step?: number;
      style?: React.CSSProperties;
    };
  };
  // Field rules system
  fieldRules?: FormGridRules;
}

const FormGridComponent: React.FC<FormGridProps> = ({
  data,
  columns: initialColumns,
  idField = "id",
  title = "Data Grid",
  onRowClick,
  expandableContent,
  gridId,
  actions,
  editValidationSchema,
  addValidationSchema,
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
  fieldConfigurations = {},
  fieldRules,
}) => {
  // State for inline editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingSaving, setEditingSaving] = useState(false);

  // State for inline adding
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);

  // Create rules engine instance
  const rulesEngine = useMemo(() => {
    if (!fieldRules) return null;
    return new FieldRulesEngine(fieldRules);
  }, [fieldRules]);

  // Update rules engine when fieldRules change
  useEffect(() => {
    if (rulesEngine && fieldRules?.parentData) {
      rulesEngine.updateParentData(fieldRules.parentData);
    }
    if (rulesEngine && fieldRules?.externalData) {
      rulesEngine.updateExternalData(fieldRules.externalData);
    }
  }, [rulesEngine, fieldRules]);

  // Get grid state from Zustand
  const {
    grid,
    initializeGrid,
    getMergedColumns,
    setSortState,
    setGroupState,
    setSearchTerm,
    toggleRowExpanded,
    isRowExpanded,
  } = useGrid(gridId);

  // Forms for editing and adding
  const editForm = useForm({
    resolver: editValidationSchema ? zodResolver(editValidationSchema) : undefined,
    mode: "onChange",
  });

  const addForm = useForm({
    resolver: addValidationSchema ? zodResolver(addValidationSchema) : undefined,
    mode: "onChange",
    defaultValues: defaultNewRow,
  });

  // Initialize grid if not already initialized
  useEffect(() => {
    initializeGrid(initialColumns);
  }, [initialColumns, initializeGrid]);

  // Always define these, even when grid is null
  // Use getMergedColumns to combine persisted config with render functions from code
  const columns = getMergedColumns(initialColumns);
  const sortState = grid?.sortState || { column: null, direction: null };
  const groupState = grid?.groupState || { column: null };
  const searchTerm = grid?.searchTerm || "";

  // Functions for inline editing
  const startEditing = (row: any) => {
    const rowId = row[idField];
    setEditingRowId(String(rowId));
    editForm.reset(row);
    
    // Execute initialization rules for editing
    if (rulesEngine) {
      setTimeout(() => {
        rulesEngine.executeInitializationRules(
          editForm.getValues(),
          (field: string, value: any) => editForm.setValue(field, value)
        );
      }, 0);
    }
    
    onEditStart?.(row);
  };

  const cancelEditing = () => {
    if (editingRowId) {
      const originalRow = data.find(row => String(row[idField]) === editingRowId);
      onEditCancel?.(originalRow);
    }
    setEditingRowId(null);
    editForm.reset();
  };

  const saveEditing = async () => {
    if (!editingRowId || !onEditSave) return;
    
    const isValid = await editForm.trigger();
    if (!isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    setEditingSaving(true);
    try {
      const originalRow = data.find(row => String(row[idField]) === editingRowId);
      const updatedRow = editForm.getValues();
      await onEditSave(originalRow, updatedRow);
      setEditingRowId(null);
      editForm.reset();
      toast({
        title: "Éxito",
        description: "Registro actualizado correctamente",
      });
    } catch (error) {
      console.error('Error saving edit:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setEditingSaving(false);
    }
  };

  // Functions for inline adding
  const startAdding = () => {
    setIsAddingNewRow(true);
    addForm.reset(defaultNewRow);
    
    // Execute initialization rules for new row
    if (rulesEngine) {
      setTimeout(() => {
        rulesEngine.executeInitializationRules(
          addForm.getValues(),
          (field: string, value: any) => addForm.setValue(field, value)
        );
      }, 0);
    }
  };

  const cancelAdding = () => {
    setIsAddingNewRow(false);
    addForm.reset(defaultNewRow);
  };

  const saveAdding = async () => {
    if (!onInlineAdd) return;
    
    const isValid = await addForm.trigger();
    if (!isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    setAddingSaving(true);
    try {
      const newRow = addForm.getValues();
      await onInlineAdd(newRow);
      setIsAddingNewRow(false);
      addForm.reset(defaultNewRow);
      toast({
        title: "Éxito",
        description: "Registro agregado correctamente",
      });
    } catch (error) {
      console.error('Error adding row:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el registro",
        variant: "destructive",
      });
    } finally {
      setAddingSaving(false);
    }
  };

  // Render field based on configuration
  const renderFormField = (
    column: Column,
    control: any,
    mode: 'edit' | 'add',
    customRender?: { [columnId: string]: (control: any, field: any, formState: any) => React.ReactNode }
  ) => {
    const fieldConfig = fieldConfigurations[column.id] || {};
    const isColumnEditable = mode === 'edit' ? editableColumns.includes(column.id) : (addableColumns.length > 0 ? addableColumns.includes(column.id) : editableColumns.includes(column.id));
    
    if (!isColumnEditable) {
      return null;
    }

    return (
      <FormField
        control={control}
        name={column.accessor}
        render={({ field, formState }) => (
          <FormItem>
            <FormControl>
              {customRender?.[column.id] ? (
                customRender[column.id](control, field, formState)
              ) : (
                renderDefaultField(field, fieldConfig, formState, column.accessor, mode)
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderDefaultField = (field: any, config: any, formState: any, columnAccessor?: string, mode?: 'edit' | 'add') => {
    const { type = 'text', placeholder, options, min, max, step, style } = config;
    
    // Helper function to handle field changes and execute rules
    const handleFieldChange = (value: any) => {
      field.onChange(value);
      
      // Execute rules if engine is available and we have the column accessor
      if (rulesEngine && columnAccessor) {
        const currentForm = mode === 'edit' ? editForm : addForm;
        setTimeout(() => {
          rulesEngine.executeRules(
            columnAccessor,
            value,
            currentForm.getValues(),
            (fieldName: string, newValue: any) => currentForm.setValue(fieldName, newValue)
          );
        }, 0);
      }
    };
    
    switch (type) {
      case 'select':
        return (
          <Select
            value={field.value || ""}
            onValueChange={handleFieldChange}
          >
            <SelectTrigger className="h-8 text-xs" style={style}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={field.value || false}
            onChange={(e) => handleFieldChange(e.target.checked)}
            className="h-4 w-4"
            style={style}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="h-8 text-xs"
            style={style}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="h-8 text-xs"
            style={style}
          />
        );
      
      case 'time':
        return (
          <Input
            type="time"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="h-8 text-xs"
            style={style}
          />
        );
      
      case 'datetime-local':
        return (
          <Input
            type="datetime-local"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="h-8 text-xs"
            style={style}
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs"
            style={style}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={field.value || ""}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs"
            style={style}
          />
        );
    }
  };

  const renderEditableCell = (column: Column, row: any) => {
    const rowId = String(row[idField]);
    const isEditing = rowId === editingRowId;
    const isColumnEditable = editableColumns.includes(column.id);
    
    if (!isEditing || !isColumnEditable) {
      return column.render
        ? column.render(row[column.accessor], row)
        : row[column.accessor] != null
          ? String(row[column.accessor])
          : "";
    }

    return (
      <Form {...editForm}>
        {renderFormField(column, editForm.control, 'edit', customEditRender)}
      </Form>
    );
  };

  const renderNewRowCell = (column: Column) => {
    const isColumnAddable = addableColumns.length > 0 ? addableColumns.includes(column.id) : editableColumns.includes(column.id);
    
    if (!isColumnAddable) {
      return "";
    }

    return (
      <Form {...addForm}>
        {renderFormField(column, addForm.control, 'add', customAddRender)}
      </Form>
    );
  };

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
      <tr className="border-b border-border">
        {visibleColumns.map((column) => (
          <th
            key={column.id}
            className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => column.sortable && handleSort(column.accessor)}
          >
            <div className="flex items-center space-x-1">
              <span>{column.header}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp
                    className={`h-3 w-3 ${
                      sortState.column === column.accessor && sortState.direction === "asc"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <ChevronDown
                    className={`h-3 w-3 -mt-1 ${
                      sortState.column === column.accessor && sortState.direction === "desc"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
        {(actions || enableInlineEdit) && (
          <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Acciones
          </th>
        )}
      </tr>
    );
  };

  const renderCells = (row: any) => {
    const visibleColumns = columns.filter((col) => col.visible);
    
    return visibleColumns.map((column) => (
      <td key={column.id} className="px-2 py-3 whitespace-nowrap text-sm text-foreground">
        {renderEditableCell(column, row)}
      </td>
    ));
  };

  const renderEditActions = (row: any) => {
    const rowId = String(row[idField]);
    const isEditing = rowId === editingRowId;
    
    if (isEditing) {
      return (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={saveEditing}
            disabled={editingSaving}
            title="Guardar"
            className="h-8 w-8"
          >
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelEditing}
            disabled={editingSaving}
            title="Cancelar"
            className="h-8 w-8"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex space-x-1">
        {enableInlineEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startEditing(row)}
            title="Editar"
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {actions && actions(row)}
      </div>
    );
  };

  const renderAddActions = () => {
    if (isAddingNewRow) {
      return (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={saveAdding}
            disabled={addingSaving}
            title="Guardar"
            className="h-8 w-8"
          >
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelAdding}
            disabled={addingSaving}
            title="Cancelar"
            className="h-8 w-8"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const renderNewRow = () => {
    if (!isAddingNewRow) return null;
    
    const visibleColumns = columns.filter((col) => col.visible);
    
    return (
      <tr className="border-b border-border bg-muted/30">
        {visibleColumns.map((column) => (
          <td key={column.id} className="px-2 py-3 whitespace-nowrap text-sm">
            {renderNewRowCell(column)}
          </td>
        ))}
        <td className="px-2 py-3 whitespace-nowrap text-sm">
          {renderAddActions()}
        </td>
      </tr>
    );
  };

  const renderRows = () => {
    if (!paginatedData || paginatedData.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.filter((col) => col.visible).length + 1}
            className="px-2 py-8 text-center text-muted-foreground"
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
            className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onRowClick && onRowClick(row)}
          >
            {expandableContent && (
              <td className="px-2 py-3 w-8">
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
            {(actions || enableInlineEdit) && (
              <td className="px-2 py-3 whitespace-nowrap text-sm">
                {renderEditActions(row)}
              </td>
            )}
          </tr>
          {isExpanded && expandableContent && (
            <tr>
              <td
                colSpan={
                  columns.filter((col) => col.visible).length +
                  (expandableContent ? 1 : 0) +
                  (actions || enableInlineEdit ? 1 : 0)
                }
                className="p-0"
              >
                <div className="bg-muted border-l-4 border-primary">
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
        <tr className="bg-muted/80 border-b border-border">
          <td
            colSpan={
              columns.filter((col) => col.visible).length +
              (expandableContent ? 1 : 0) +
              (actions || enableInlineEdit ? 1 : 0)
            }
            className="px-2 py-2 font-semibold text-muted-foreground"
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
                className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {expandableContent && (
                  <td className="px-2 py-3 w-8">
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
                {(actions || enableInlineEdit) && (
                  <td className="px-2 py-3 whitespace-nowrap text-sm">
                    {renderEditActions(row)}
                  </td>
                )}
              </tr>
              {isExpanded && expandableContent && (
                <tr>
                  <td
                    colSpan={
                      columns.filter((col) => col.visible).length +
                      (expandableContent ? 1 : 0) +
                      (actions || enableInlineEdit ? 1 : 0)
                    }
                    className="p-0"
                  >
                    <div className="bg-muted border-l-4 border-primary">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          
          {enableInlineAdd && !isAddingNewRow && (
            <Button
              onClick={startAdding}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </Button>
          )}
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
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
      )}

      {renderToolbar()}

      <div className="overflow-hidden shadow-md ring-1 ring-border rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              {renderHeaders()}
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {renderNewRow()}
              {renderRows()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-3 bg-background border-t border-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedData.length)} a{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)} de{" "}
            {filteredAndSortedData.length} resultados
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filas por página:</span>
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
            
            <span className="text-sm text-muted-foreground px-2">
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

export const FormGrid: React.FC<FormGridProps> = (props) => {
  return <FormGridComponent {...props} />;
}; 