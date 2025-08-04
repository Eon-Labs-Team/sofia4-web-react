import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, X, SkipForward } from "lucide-react";
import { WizardNavigationProps } from "./types";

const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onNext,
  onPrevious,
  onCancel,
  onComplete,
  canGoNext,
  canGoPrevious,
  isFirst,
  isLast,
  isSubmitting,
  nextButtonText = "Siguiente",
  previousButtonText = "Anterior",
  cancelButtonText = "Cancelar",
  submitButtonText = "Finalizar",
  currentStep,
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            {cancelButtonText}
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        {!isFirst && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {previousButtonText}
          </Button>
        )}

        {currentStep?.isOptional && !isLast && (
          <Button
            type="button"
            variant="secondary"
            onClick={onNext}
            disabled={isSubmitting}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Saltar
          </Button>
        )}

        {!isLast ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
          >
            {nextButtonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onComplete}
            disabled={!canGoNext || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;