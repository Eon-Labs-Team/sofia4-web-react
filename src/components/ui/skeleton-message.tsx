import React from 'react';
import { Bot, CheckCircle2, Loader2, FileText, Database, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SkeletonMessageProps {
  currentStep: number;
  totalSteps: number;
  currentMessage: string;
  isLarge?: boolean;
}

const STEP_ICONS = {
  1: Zap,
  2: CheckCircle2,
  3: FileText,
  4: Database,
  5: Database,
  6: BarChart3,
};

const STEP_COLORS = {
  1: 'text-blue-500',
  2: 'text-green-500',
  3: 'text-orange-500',
  4: 'text-purple-500',
  5: 'text-indigo-500',
  6: 'text-pink-500',
};

export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({
  currentStep,
  totalSteps,
  currentMessage,
  isLarge = false,
}) => {
  const progress = (currentStep / totalSteps) * 100;
  const IconComponent = STEP_ICONS[currentStep as keyof typeof STEP_ICONS] || Loader2;
  const iconColor = STEP_COLORS[currentStep as keyof typeof STEP_COLORS] || 'text-gray-500';

  return (
    <div className="flex gap-3 justify-start">
      {/* Avatar */}
      <div className={cn(
        "rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0",
        isLarge ? "w-12 h-12" : "w-8 h-8"
      )}>
        <Bot className={cn(
          "text-blue-600",
          isLarge ? "h-6 w-6" : "h-4 w-4"
        )} />
      </div>
      
      {/* Content */}
      <div className={cn(
        'space-y-3 max-w-full',
        isLarge ? 'max-w-[800px]' : 'max-w-[400px]'
      )}>
        {/* Main message bubble */}
        <div className={cn(
          'rounded-lg px-3 py-3 bg-gray-100 text-gray-900 space-y-3',
          isLarge ? 'text-base' : 'text-sm'
        )}>
          {/* Progress header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconComponent className={cn(
                "animate-spin flex-shrink-0",
                iconColor,
                isLarge ? "h-5 w-5" : "h-4 w-4"
              )} />
              <span className="font-medium">Procesando...</span>
            </div>
            <div className="text-xs text-gray-500">
              {currentStep}/{totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className={cn(
                "w-full transition-all duration-500 ease-out",
                isLarge ? "h-2" : "h-1.5"
              )}
            />
            <div className={cn(
              "text-gray-600",
              isLarge ? "text-sm" : "text-xs"
            )}>
              {progress.toFixed(0)}% completado
            </div>
          </div>

          {/* Current step message */}
          <div className={cn(
            "text-gray-700 border-l-2 border-blue-200 pl-3",
            isLarge ? "text-base" : "text-sm"
          )}>
            {currentMessage}
          </div>

          {/* Steps list */}
          <div className="space-y-1 mt-3">
            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1;
              const isCompleted = step < currentStep;
              const isCurrent = step === currentStep;
              const StepIcon = STEP_ICONS[step as keyof typeof STEP_ICONS] || FileText;
              const stepColor = STEP_COLORS[step as keyof typeof STEP_COLORS] || 'text-gray-400';

              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isLarge ? "text-sm" : "text-xs"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 rounded-full flex items-center justify-center",
                    isCompleted 
                      ? "bg-green-100" 
                      : isCurrent 
                        ? "bg-blue-100" 
                        : "bg-gray-100",
                    isLarge ? "w-6 h-6" : "w-5 h-5"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className={cn(
                        "text-green-600",
                        isLarge ? "h-4 w-4" : "h-3 w-3"
                      )} />
                    ) : (
                      <StepIcon className={cn(
                        isCurrent ? `${stepColor} animate-pulse` : "text-gray-400",
                        isLarge ? "h-4 w-4" : "h-3 w-3"
                      )} />
                    )}
                  </div>
                  <span className={cn(
                    "transition-colors duration-200",
                    isCompleted 
                      ? "text-green-700 font-medium" 
                      : isCurrent 
                        ? "text-blue-700 font-medium" 
                        : "text-gray-500"
                  )}>
                    {getStepName(step)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Animated dots */}
        <div className="flex items-center gap-1">
          <div className={cn(
            "flex gap-1",
            isLarge ? "text-base" : "text-sm"
          )}>
            <span className="text-gray-500">sofIA está trabajando</span>
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "text-gray-500",
          isLarge ? "text-sm" : "text-xs"
        )}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

function getStepName(step: number): string {
  const stepNames = {
    1: 'Inicializando',
    2: 'Autenticación',
    3: 'Análisis de consulta',
    4: 'Generación de query',
    5: 'Ejecución en BD',
    6: 'Interpretación final',
  };

  return stepNames[step as keyof typeof stepNames] || `Paso ${step}`;
}
