import React, { useState, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

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

  const { watch, getValues, trigger, formState } = formMethods;

  // Watch all form values for reactivity
  const watchedValues = watch();

  // Apply field onChange handlers for reactivity
  useEffect(() => {
    steps.forEach(step => {
      step.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.onChange) {
            field.onChange(
              watchedValues[field.name],
              formMethods.setValue,
              getValues
            );
          }
        });
      });
    });
  }, [watchedValues, steps, formMethods.setValue, getValues]);

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
                <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                {currentStep.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentStep.description}
                  </p>
                )}
              </div>

              {currentStep.sections.map((section) => (
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