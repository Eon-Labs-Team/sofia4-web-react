import React, { useMemo } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Column, useGrid } from "@/lib/store/gridStore";

interface ColumnConfigurationProps {
  columns: Column[];
  gridId: string; // Added to identify which grid to modify
}

const ColumnConfiguration: React.FC<ColumnConfigurationProps> = ({
  columns,
  gridId,
}) => {
  const {
    grid,
    toggleColumnVisibility,
    resetColumnConfiguration,
  } = useGrid(gridId);

  // Use the columns from the grid if available, otherwise use the provided ones
  const configuredColumns = useMemo(() => {
    return grid?.columns || columns;
  }, [grid, columns]);

  // Save column configuration by persisting the columns
  // The store will automatically persist changes to localStorage
  const saveColumnConfiguration = () => {
    // Nothing needed here as Zustand persist middleware will handle storage
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Configure Columns">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Column Configuration</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {configuredColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                />
                <Label
                  htmlFor={`column-${column.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.header}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => resetColumnConfiguration(columns)}
          >
            Reset to Default
          </Button>
          <DialogClose asChild>
            <Button type="button" onClick={saveColumnConfiguration}>
              Save Changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnConfiguration;
