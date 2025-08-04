import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DynamicForm from "@/components/DynamicForm/DynamicForm";
import { WizardStepProps } from "./types";

const WizardStep: React.FC<WizardStepProps> = ({
  step,
  isActive,
  isCompleted,
}) => {
  if (!isActive) return null;

  return (
    <Card className="min-h-[400px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{step.title}</CardTitle>
            {step.description && (
              <CardDescription className="mt-2">
                {step.description}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            {step.isOptional && (
              <Badge variant="outline">Opcional</Badge>
            )}
            {isCompleted && (
              <Badge variant="default" className="bg-green-500">
                Completado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <DynamicForm
          sections={step.sections}
          onSubmit={() => {}} // This will be handled by the parent Wizard
          validationSchema={step.validationSchema}
        />
      </CardContent>
    </Card>
  );
};

export default WizardStep;