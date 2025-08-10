import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import FormSection from "./FormSection";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FormGridRules, FieldRulesEngine } from "@/lib/validationSchemas";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "radio"
  | "select"
  | "date"
  | "email"
  | "password"
  | "file"
  | "hidden"
  | "captcha"
  | "range"
  | "url"
  | "search"
  | "autocomplete"
  | "grid"
  | "selectableGrid"
  | "signature";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  rows?: number;
  cols?: number;
  accept?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  defaultValue?: any;
  helperText?: string;
  gridConfig?: any; // Configuration for nested grid
  onChange?: (value: any, setValue: any, getValues?: any) => void; // Custom onChange handler
}

export interface SectionConfig {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
}

export interface DynamicFormProps {
  sections: SectionConfig[];
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  validationSchema?: z.ZodType<any>;
  enabledButtons?: boolean;
  // Field rules support
  fieldRules?: FormGridRules;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  sections,
  onSubmit,
  defaultValues = {},
  validationSchema,
  enabledButtons = true,
  fieldRules,
}) => {
  const [formSections, setFormSections] = useState<SectionConfig[]>(sections);
  const rulesEngineRef = useRef<FieldRulesEngine | null>(null);

  // Initialize rules engine
  useEffect(() => {
    if (fieldRules) {
      rulesEngineRef.current = new FieldRulesEngine(
        fieldRules, 
        process.env.NODE_ENV === 'development' // debug solo en desarrollo
      );
    }
  }, [fieldRules]);

  // Create form methods with optional schema validation
  const formMethods = useForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  const { setValue, getValues } = formMethods;
  
  // Obtener campos que necesitan watch (solo los que tienen reglas)
  const watchedFieldNames = useMemo(() => {
    return rulesEngineRef.current ? rulesEngineRef.current.getWatchedFields() : [];
  }, [fieldRules]);

  // Watch selectivo - solo campos con reglas activas
  const watchedValues = useWatch({
    control: formMethods.control,
    name: watchedFieldNames.length > 0 ? watchedFieldNames : undefined
  });

  const prevValuesRef = useRef<Record<string, any>>({});

  // Execute field rules when values change (solo para campos con reglas)
  useEffect(() => {
    if (rulesEngineRef.current && watchedValues) {
      // Convertir watchedValues a objeto si es necesario
      const valuesObj = Array.isArray(watchedValues) 
        ? watchedFieldNames.reduce((acc, fieldName, index) => {
            acc[fieldName] = watchedValues[index];
            return acc;
          }, {} as Record<string, any>)
        : watchedValues;

      // Only execute rules for fields that actually changed
      Object.keys(valuesObj).forEach(fieldName => {
        const currentValue = valuesObj[fieldName];
        const previousValue = prevValuesRef.current[fieldName];
        
        // Execute rules only if value actually changed
        if (currentValue !== previousValue) {
          rulesEngineRef.current!.executeRules(
            fieldName,
            currentValue,
            formMethods.getValues(), // Pasar todos los valores del form
            setValue
          );
        }
      });
      
      // Update previous values
      prevValuesRef.current = { ...valuesObj };
    }
  }, [watchedValues, setValue, watchedFieldNames]);

  // Execute initialization rules on mount
  useEffect(() => {
    if (rulesEngineRef.current) {
      rulesEngineRef.current.executeInitializationRules(getValues(), setValue);
    }
  }, [setValue, getValues]);

  const handleSubmit = formMethods.handleSubmit((data) => {
    // Process any selectableGrid data to ensure it's properly formatted
    const processedData = { ...data };

    // Loop through all sections to find selectableGrid fields
    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === "selectableGrid" && processedData[field.name]) {
          // Ensure the data is an array (in case it was somehow converted)
          if (!Array.isArray(processedData[field.name])) {
            processedData[field.name] = [];
          }
        }
      });
    });

    onSubmit(processedData);
  });

  const handleReset = () => {
    formMethods.reset(defaultValues);
  };

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const draggedSection = formSections[dragIndex];
    const newSections = [...formSections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);
    setFormSections(newSections);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formSections.map((section, index) => (
            <FormSection
              key={section.id}
              section={section}
              index={index}
              moveSection={moveSection}
            />
          ))}
          {enabledButtons && (<div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>)}
        </form>
      </FormProvider>
    </DndProvider>
  );
};

export default DynamicForm;
