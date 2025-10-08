import React from "react";
import { z } from "zod";
import { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { FormGridRules } from "@/lib/validationSchemas";
import type { IWork } from "@eon-lib/eon-mongoose/types";

export interface WizardStepConfig {
  id: string;
  title: string;
  description?: string;
  sections: SectionConfig[];
  validationSchema?: z.ZodType<any>;
  isOptional?: boolean;
  // New: Support for custom JSX content instead of sections
  customContent?: React.ReactNode;
  // New: Custom validation function for steps with customContent
  customValidation?: (formValues: any) => boolean;
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

// New types for WorkAssociationWizard
export interface WorkAssociationData {
  associateWork: boolean;
  entityType: string;
  entityId: string;
  // Usamos directamente IWork que ya tiene workers, machinery y products como arrays
  workData: Partial<IWork>;
}

export interface WorkAssociationWizardProps {
  entityType: string;
  entityData: Record<string, any>;
  onComplete: (data: WorkAssociationData) => Promise<void> | void;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  
  // Optional data arrays for form options
  taskTypes?: any[];
  allTasks?: any[];
  workerList?: any[];
  cuarteles?: any[];
  productOptions?: any[];
  machineryOptions?: any[];
}

export interface EntityAssociationConfig {
  entityType: string;
  entityDisplayName: string;
  entityIdField: string;
  customFields?: SectionConfig[];
  requiredWorkFields?: string[];
  allowedWorkTypes?: ('A' | 'C' | 'T')[];
}

export interface WorkAssociationResult {
  success: boolean;
  workId?: string;
  entityId: string;
  associationId?: string;
  message: string;
}