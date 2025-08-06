import { z } from "zod";
import { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { FormGridRules } from "@/lib/validationSchemas";

export interface WizardStepConfig {
  id: string;
  title: string;
  description?: string;
  sections: SectionConfig[];
  validationSchema?: z.ZodType<any>;
  isOptional?: boolean;
}

export interface WizardProps {
  title: string;
  description?: string;
  steps: WizardStepConfig[];
  onComplete: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  validationSchema?: z.ZodType<any>;
  showProgress?: boolean;
  allowSkipOptional?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  nextButtonText?: string;
  previousButtonText?: string;
  // Field rules support
  fieldRules?: FormGridRules;
}

export interface WizardStepProps {
  step: WizardStepConfig;
  isActive: boolean;
  isCompleted: boolean;
  canProceed: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

export interface WizardProgressProps {
  steps: WizardStepConfig[];
  currentStepIndex: number;
  completedSteps: string[];
}

export interface WizardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
  onComplete: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  cancelButtonText?: string;
  submitButtonText?: string;
  currentStep?: WizardStepConfig;
}