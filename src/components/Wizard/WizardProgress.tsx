import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardProgressProps } from "./types";

const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStepIndex,
  completedSteps,
}) => {
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center flex-1 min-h-[80px]",
                index !== steps.length - 1 && "border-r border-border pr-2 mr-2"
              )}
            >
              {/* Icono con altura fija */}
              <div className="flex items-center justify-center mb-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-primary border-primary text-primary-foreground",
                    isPending && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
              </div>
              
              {/* Contenido de texto con altura flexible */}
              <div className="text-center flex flex-col items-center space-y-1 px-1">
                <p
                  className={cn(
                    "text-xs font-medium text-center leading-tight",
                    isCompleted && "text-green-600",
                    isCurrent && "text-primary",
                    isPending && "text-muted-foreground"
                  )}
                  style={{ 
                    wordBreak: "break-word",
                    hyphens: "auto",
                    maxWidth: "100px"
                  }}
                >
                  {step.title}
                </p>
                
                {step.isOptional && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                    Opcional
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Paso {currentStepIndex + 1} de {steps.length}
      </div>
    </div>
  );
};

export default WizardProgress;