import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SplitButtonOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SplitButtonProps extends Omit<ButtonProps, "onClick"> {
  options: SplitButtonOption[];
  onOptionSelect: (option: SplitButtonOption) => void;
  defaultOption?: SplitButtonOption;
  primaryAction?: () => void;
  dropdownAlign?: "start" | "end";
  splitVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  ({
    options,
    onOptionSelect,
    defaultOption,
    primaryAction,
    children,
    className,
    variant = "default",
    size = "default",
    dropdownAlign = "end",
    splitVariant,
    disabled,
    ...props
  }, ref) => {
    const [selectedOption, setSelectedOption] = React.useState<SplitButtonOption>(
      defaultOption || options[0]
    );

    const handleOptionSelect = (option: SplitButtonOption) => {
      setSelectedOption(option);
      onOptionSelect(option);
    };

    const handlePrimaryClick = () => {
      if (primaryAction) {
        primaryAction();
      } else {
        onOptionSelect(selectedOption);
      }
    };

    const buttonVariant = splitVariant || variant;

    return (
      <div ref={ref} className={cn("flex", className)} {...props}>
        {/* Primary Button */}
        <Button
          variant={buttonVariant}
          size={size}
          onClick={handlePrimaryClick}
          disabled={disabled}
          className={cn(
            "rounded-r-none border-r-0",
            size === "sm" && "px-3",
            size === "lg" && "px-8"
          )}
        >
          {selectedOption.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          {children || selectedOption.label}
        </Button>

        {/* Dropdown Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={buttonVariant}
              size={size}
              disabled={disabled}
              className={cn(
                "rounded-l-none border-l border-l-white/20 px-2",
                size === "sm" && "px-1.5",
                size === "lg" && "px-3"
              )}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Más opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dropdownAlign} className="min-w-[160px]">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                onClick={() => handleOptionSelect(option)}
                className="flex items-center"
              >
                {option.icon && (
                  <span className="mr-2">{option.icon}</span>
                )}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

SplitButton.displayName = "SplitButton";

export { SplitButton };