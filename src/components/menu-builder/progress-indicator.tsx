"use client"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground font-open-sans">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-muted-foreground font-open-sans">
          {Math.round(progress)}% Completado
        </span>
      </div>
      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
