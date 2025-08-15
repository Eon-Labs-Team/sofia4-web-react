import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import FormField from "@/components/DynamicForm/FormField";
import WizardProgress from "./WizardProgress";
import WizardNavigation from "./WizardNavigation";
import { WizardProps } from "./types";
import { FieldRulesEngine } from "@/lib/validationSchemas";

const Wizard: React.FC<WizardProps> = ({
  title,
  description,
  steps,
  onComplete,
  onCancel,
  defaultValues = {},
  validationSchema,
  showProgress = true,
  allowSkipOptional = true,
  submitButtonText = "Finalizar",
  cancelButtonText = "Cancelar",
  nextButtonText = "Siguiente",
  previousButtonText = "Anterior",
  fieldRules,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const rulesEngineRef = useRef<FieldRulesEngine | null>(null);
  
  // Estado para manejar opciones dinámicas filtradas
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  // Actualizar currentStep con opciones dinámicas
  const currentStepWithDynamicOptions = useMemo(() => {
    if (!currentStep || Object.keys(dynamicOptions).length === 0) return currentStep;
    
    return {
      ...currentStep,
      sections: currentStep.sections.map(section => ({
        ...section,
        fields: section.fields.map(field => {
          // Si hay opciones dinámicas para este campo, usarlas
          if (dynamicOptions[field.name] && field.type === 'select') {
            return {
              ...field,
              options: dynamicOptions[field.name]
            };
          }
          return field;
        })
      }))
    };
  }, [currentStep, dynamicOptions]);

  // Create combined validation schema for all steps
  const combinedSchema = React.useMemo(() => {
    if (validationSchema) return validationSchema;
    
    const stepSchemas = steps.reduce((acc, step) => {
      if (step.validationSchema) {
        acc[step.id] = step.validationSchema;
      }
      return acc;
    }, {} as Record<string, z.ZodType<any>>);

    if (Object.keys(stepSchemas).length === 0) return undefined;

    return z.object(stepSchemas);
  }, [steps, validationSchema]);

  const formMethods = useForm({
    defaultValues,
    resolver: combinedSchema ? zodResolver(combinedSchema) : undefined,
    mode: "onChange",
  });

  const { getValues, trigger, formState, setValue } = formMethods;

  // Initialize rules engine
  useEffect(() => {
    if (fieldRules) {
      rulesEngineRef.current = new FieldRulesEngine(
        fieldRules, 
        process.env.NODE_ENV === 'development' // debug solo en desarrollo
      );
      
      // Registrar callbacks para filtrado de opciones
      fieldRules.rules?.forEach(rule => {
        if (rule.action.type === 'filterOptions' && rule.action.targetField) {
          const fieldName = rule.action.targetField;
          
          rulesEngineRef.current?.registerOptionFilterCallback(
            fieldName,
            (filteredOptions: any[]) => {
              // Convertir a formato de opciones para el select
              const selectOptions = filteredOptions.map(item => ({
                value: item._id || item.id || item.value,
                label: item.name || item.taskName || item.varietyName || item.cropName || item.label || item._id
              }));
              
              setDynamicOptions(prev => ({
                ...prev,
                [fieldName]: selectOptions
              }));
            }
          );
        }
      });
    }
    
    return () => {
      // Cleanup callbacks
      if (rulesEngineRef.current && fieldRules?.rules) {
        fieldRules.rules.forEach(rule => {
          if (rule.action.type === 'filterOptions' && rule.action.targetField) {
            rulesEngineRef.current?.unregisterOptionFilterCallback(rule.action.targetField);
          }
        });
      }
    };
  }, [fieldRules]);

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

  // Apply field rules and onChange handlers for reactivity
  useEffect(() => {
    // Execute field rules first (only for changed fields)
    if (rulesEngineRef.current && watchedValues) {
      // Convertir watchedValues a objeto si es necesario
      const valuesObj = Array.isArray(watchedValues) 
        ? watchedFieldNames.reduce((acc, fieldName, index) => {
            acc[fieldName] = watchedValues[index];
            return acc;
          }, {} as Record<string, any>)
        : watchedValues;

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
    }

    // Then apply custom onChange handlers (for backward compatibility, only for changed fields)
    if (watchedValues) {
      const valuesObj = Array.isArray(watchedValues) 
        ? watchedFieldNames.reduce((acc, fieldName, index) => {
            acc[fieldName] = watchedValues[index];
            return acc;
          }, {} as Record<string, any>)
        : watchedValues;

      steps.forEach(step => {
        step.sections.forEach(section => {
          section.fields.forEach(field => {
            if (field.onChange && valuesObj.hasOwnProperty(field.name)) {
              const currentValue = valuesObj[field.name];
              const previousValue = prevValuesRef.current[field.name];
              
              // Execute onChange only if value actually changed
              if (currentValue !== previousValue) {
                field.onChange(
                  currentValue,
                  setValue,
                  getValues
                );
              }
            }
          });
        });
      });
      
      // Update previous values
      prevValuesRef.current = { ...valuesObj };
    }
  }, [watchedValues, steps, setValue, getValues, watchedFieldNames]);

  // Execute initialization rules on mount
  useEffect(() => {
    if (rulesEngineRef.current) {
      rulesEngineRef.current.executeInitializationRules(getValues(), setValue);
    }
  }, [setValue, getValues]);

  const validateCurrentStep = useCallback(async () => {
    if (!currentStep.validationSchema) return true;

    try {
      // Get relevant fields for current step
      const stepFieldNames = currentStep.sections.flatMap(section =>
        section.fields.map(field => field.name)
      );
      
      const stepData = stepFieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = getValues(fieldName);
        return acc;
      }, {} as Record<string, any>);

      await currentStep.validationSchema.parseAsync(stepData);
      setStepErrors(prev => ({ ...prev, [currentStep.id]: "" }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => err.message).join(", ");
        setStepErrors(prev => ({ ...prev, [currentStep.id]: errorMessage }));
        toast({
          title: "Error de validación",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [currentStep, getValues]);

  const canProceed = useCallback(() => {
    if (currentStep.isOptional && allowSkipOptional) return true;
    
    // Check if step has required fields
    const requiredFields = currentStep.sections.flatMap(section =>
      section.fields.filter(field => field.required).map(field => field.name)
    );

    const currentValues = getValues();
    return requiredFields.every(fieldName => {
      const value = currentValues[fieldName];
      return value !== undefined && value !== null && value !== "";
    });
  }, [currentStep, allowSkipOptional, getValues]);

  const handleNext = useCallback(async () => {
    if (!canProceed()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos requeridos antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Mark current step as completed
    setCompletedSteps(prev => [...prev.filter(id => id !== currentStep.id), currentStep.id]);
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [canProceed, validateCurrentStep, currentStep.id, currentStepIndex, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Validate all steps if not optional
      for (const step of steps) {
        if (!step.isOptional || completedSteps.includes(step.id)) {
          if (step.validationSchema) {
            const stepFieldNames = step.sections.flatMap(section =>
              section.fields.map(field => field.name)
            );
            
            const stepData = stepFieldNames.reduce((acc, fieldName) => {
              acc[fieldName] = getValues(fieldName);
              return acc;
            }, {} as Record<string, any>);

            await step.validationSchema.parseAsync(stepData);
          }
        }
      }

      const allData = getValues();
      await onComplete(allData);
      
      toast({
        title: "Éxito",
        description: "El wizard se completó correctamente.",
      });
    } catch (error) {
      console.error("Error completing wizard:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al completar el wizard. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [steps, completedSteps, getValues, onComplete]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {showProgress && (
            <div className="mb-6">
              <WizardProgress
                steps={steps}
                currentStepIndex={currentStepIndex}
                completedSteps={completedSteps}
              />
            </div>
          )}

          {stepErrors[currentStep.id] && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{stepErrors[currentStep.id]}</AlertDescription>
            </Alert>
          )}

          <FormProvider {...formMethods}>
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{currentStepWithDynamicOptions.title}</h3>
                {currentStepWithDynamicOptions.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentStepWithDynamicOptions.description}
                  </p>
                )}
              </div>

              {currentStepWithDynamicOptions.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  {section.title && (
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        {section.title}
                      </h4>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <div 
                        key={field.id} 
                        className={field.type === "textarea" ? "md:col-span-2" : ""}
                      >
                        <FormField field={field} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FormProvider>

          <WizardNavigation
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={onCancel}
            onComplete={handleComplete}
            canGoNext={canProceed()}
            canGoPrevious={!isFirst}
            isFirst={isFirst}
            isLast={isLast}
            isSubmitting={isSubmitting}
            nextButtonText={nextButtonText}
            previousButtonText={previousButtonText}
            cancelButtonText={cancelButtonText}
            submitButtonText={submitButtonText}
            currentStep={currentStep}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Wizard;