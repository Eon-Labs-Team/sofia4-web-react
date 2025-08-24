import React from "react";
import { Grid } from "@/components/Grid/Grid";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle, XCircle, AlertTriangle, Ban } from "lucide-react";
import type { Column } from "@/lib/store/gridStore";
import type { IWork } from "@eon-lib/eon-mongoose";
import { WORK_STATES, WorkType, WorkState } from "../types/workTypes";

interface BaseWorkGridProps {
  workType: WorkType;
  works: IWork[];
  columns: Column[];
  isLoading?: boolean;
  onEdit?: (work: IWork) => void;
  onDelete?: (work: IWork) => void;
  onRefresh?: () => void;
  // Props adicionales específicas por tipo de trabajo
  customActions?: (work: IWork) => React.ReactNode;
  customColumns?: Column[];
}

/**
 * Función para renderizar el estado del trabajo con iconos y colores
 */
const renderWorkState = (value: WorkState) => {
  const stateConfig = WORK_STATES[value];
  
  if (!stateConfig) return value;

  const getIcon = () => {
    switch (stateConfig.icon) {
      case 'CheckCircle':
        return <CheckCircle className={`h-4 w-4 text-${stateConfig.color}-500 mr-2`} />;
      case 'AlertTriangle':
        return <AlertTriangle className={`h-4 w-4 text-${stateConfig.color}-500 mr-2`} />;
      case 'XCircle':
        return value === 'void' 
          ? <XCircle className="h-4 w-4 text-muted-foreground mr-2" />
          : <XCircle className={`h-4 w-4 text-${stateConfig.color}-500 mr-2`} />;
      case 'Ban':
        return <Ban className={`h-4 w-4 text-${stateConfig.color}-500 mr-2`} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      <span>{stateConfig.label}</span>
    </div>
  );
};

/**
 * Función para renderizar acciones por defecto
 */
const renderDefaultActions = (work: IWork, onEdit?: (work: IWork) => void, onDelete?: (work: IWork) => void) => {
  return (
    <div className="flex space-x-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(work)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {/* {onDelete && work.workState !== 'confirmed' && ( */}
        {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(work)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

/**
 * Componente base para grid de trabajos
 * Reutilizable para todos los tipos de trabajo
 */
export const BaseWorkGrid: React.FC<BaseWorkGridProps> = ({
  workType,
  works,
  columns,
  isLoading = false,
  onEdit,
  onDelete,
  onRefresh,
  customActions,
  customColumns = [],
}) => {
  
  // Combinar columnas base con columnas personalizadas
  const allColumns: Column[] = [
    ...columns,
    ...customColumns,
    // Columna de acciones siempre al final
    {
      id: "actions",
      header: "Acciones",
      accessor: "_id",
      visible: true,
      sortable: false,
      render: (value: string, work: IWork) => {
        const defaultActions = renderDefaultActions(work, onEdit, onDelete);
        const custom = customActions?.(work);
        
        return (
          <div className="flex items-center space-x-2">
            {defaultActions}
            {custom}
          </div>
        );
      }
    }
  ];

  // Agregar renderer para workState si no está personalizado
  const columnsWithRenderers = allColumns.map(column => {
    if (column.accessor === 'workState' && !column.render) {
      return {
        ...column,
        render: renderWorkState
      };
    }
    return column;
  });

  return (
    <div className="space-y-4">
      {/* Header del grid */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {workType === 'A' && 'Órdenes de Aplicación'}
            {workType === 'C' && 'Cosechas'}
            {workType === 'T' && 'Trabajos Agrícolas'}
          </h2>
          <p className="text-muted-foreground">
            Gestión de trabajos tipo {workType} - {works.length} registro{works.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </Button>
        )}
      </div>

      {/* Grid principal */}
      <Grid
        data={works}
        columns={columnsWithRenderers}
        isLoading={isLoading}
        gridId={`work-grid-${workType}`}
        title={`Trabajos Tipo ${workType}`}
      />
    </div>
  );
};

export default BaseWorkGrid;