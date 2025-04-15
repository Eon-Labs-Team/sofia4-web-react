import React from "react";
import { useFormContext } from "react-hook-form";
import { FieldConfig } from "./DynamicForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  FormControl,
  FormDescription,
  FormField as HookFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Grid from "@/components/Grid/Grid";
import Captcha from "./Captcha";
import SelectableGrid from "./SelectableGrid";

interface FormFieldProps {
  field: FieldConfig;
}

const FormField: React.FC<FormFieldProps> = ({ field }) => {
  const { control, setValue } = useFormContext();

  // Render different field types
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "url":
      case "search":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <div className="relative">
                    {field.type === "search" && (
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={field.placeholder}
                      disabled={field.disabled}
                      required={field.required}
                      className={field.type === "search" ? "pl-8" : ""}
                    />
                  </div>
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    required={field.required}
                    rows={field.rows}
                  />
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                  />
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "checkbox":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={field.disabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.helperText && (
                    <FormDescription>{field.helperText}</FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "radio":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="space-y-3">
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                    disabled={field.disabled}
                  >
                    {field.options?.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={field.disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          field.placeholder || `Select ${field.label}`
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={"w-full pl-3 text-left font-normal"}
                        disabled={field.disabled}
                      >
                        {formField.value ? (
                          format(formField.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">
                            {field.placeholder || "Select a date"}
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={(date) =>
                        (field.min ? date < new Date(field.min) : false) ||
                        (field.max ? date > new Date(field.max) : false)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "range":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[formField.value || field.min || 0]}
                    max={field.max}
                    min={field.min}
                    step={field.step}
                    onValueChange={(vals) => formField.onChange(vals[0])}
                    disabled={field.disabled}
                  />
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "file":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        formField.onChange(field.multiple ? files : files[0]);
                      }
                    }}
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={field.disabled}
                    required={field.required}
                  />
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "hidden":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <input type="hidden" {...formField} />
            )}
          />
        );

      case "captcha":
        return (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              <Captcha
                onChange={(isValid) => setValue(field.name, isValid)}
                disabled={field.disabled}
              />
            </FormControl>
            {field.helperText && (
              <FormDescription>{field.helperText}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );

      case "grid":
        if (field.gridConfig) {
          return (
            <div className="col-span-2">
              <FormLabel>{field.label}</FormLabel>
              <div className="mt-2">
                <Grid
                  data={field.gridConfig.data || []}
                  columns={field.gridConfig.columns || []}
                  title={field.gridConfig.title || field.label}
                  expandableContent={field.gridConfig.expandableContent}
                />
              </div>
              {field.helperText && (
                <FormDescription>{field.helperText}</FormDescription>
              )}
            </div>
          );
        }
        return null;

      case "autocomplete":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={field.disabled}
                      >
                        {formField.value
                          ? field.options?.find(
                              (option) => option.value === formField.value,
                            )?.label
                          : field.placeholder || `Select ${field.label}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={`Search ${field.label.toLowerCase()}...`}
                        className="h-9"
                      />
                      <CommandEmpty>
                        No {field.label.toLowerCase()} found.
                      </CommandEmpty>
                      <CommandGroup>
                        {field.options?.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value || ""}
                            onSelect={() => {
                              formField.onChange(option.value);
                            }}
                          >
                            {option.label}
                            <Check
                              className={`ml-auto h-4 w-4 ${formField.value === option.value ? "opacity-100" : "opacity-0"}`}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "selectableGrid":
        return (
          <HookFormField
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="col-span-2">
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <SelectableGrid
                    columns={field.gridConfig?.columns || []}
                    data={field.gridConfig?.data || []}
                    value={formField.value || []}
                    onChange={formField.onChange}
                    multiSelect={field.gridConfig?.multiSelect !== false}
                    maxHeight={field.gridConfig?.maxHeight || 300}
                    searchable={field.gridConfig?.searchable !== false}
                  />
                </FormControl>
                {field.helperText && (
                  <FormDescription>{field.helperText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // Add more field types as needed

      default:
        return null;
    }
  };

  return renderField();
};

export default FormField;
