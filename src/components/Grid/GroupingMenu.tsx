import React, { useMemo } from "react";
import { Group, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column, GroupState, useGrid } from "@/lib/store/gridStore";

interface GroupingMenuProps {
  columns: Column[];
  gridId: string; // Added to identify which grid to modify
}

const GroupingMenu: React.FC<GroupingMenuProps> = ({ columns, gridId }) => {
  const { grid, setGroupState } = useGrid(gridId);
  
  // Use default empty group state if grid is not initialized
  const groupState = useMemo(() => {
    return grid?.groupState || { column: null };
  }, [grid]);

  // If there are no groupable columns, don't render the menu
  const groupableColumns = useMemo(() => {
    return columns.filter(col => col.groupable && col.visible);
  }, [columns]);

  if (groupableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={groupState.column ? "default" : "outline"}
          size="icon"
          className="relative"
          title="Group Data"
        >
          <Group className="h-4 w-4" />
          {groupState.column && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {groupState.column ? (
          <DropdownMenuItem onClick={() => setGroupState({ column: null })}>
            <X className="mr-2 h-4 w-4" />
            <span>Quitar agrupación</span>
          </DropdownMenuItem>
        ) : (
          <div className="text-sm px-2 py-1.5 text-muted-foreground">
            Agrupar por:
          </div>
        )}
        {groupableColumns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            onClick={() => setGroupState({ column: column.accessor })}
            className={
              groupState.column === column.accessor ? "bg-muted" : ""
            }
          >
            <Group className="mr-2 h-4 w-4" />
            <span>{column.header}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GroupingMenu;
