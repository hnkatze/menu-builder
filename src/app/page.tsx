"use client"

import { useState } from "react"
import { StepNavigation } from "../components/menu-builder/step-navigation"
import { CategoryStep } from "../components/menu-builder/category-step"
import { PreviewStep } from "../components/menu-builder/preview-step"
import { ExportStep } from "../components/menu-builder/export-step"
import { ProgressIndicator } from "../components/menu-builder/progress-indicator"

export default function MenuBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { id: 1, title: "Vista Menú", component: PreviewStep },
    { id: 2, title: "Exportar", component: ExportStep },
  ]

  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component || PreviewStep

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl font-black text-foreground mb-2 font-montserrat">Constructor de Menús</h1>
          <p className="text-muted-foreground text-lg font-open-sans">
            Crea hermosos menús interactivos para restaurantes con facilidad
          </p>
        </div>

        <ProgressIndicator currentStep={currentStep} totalSteps={2} />

        {/* Step Navigation */}
        <StepNavigation currentStep={currentStep} onStepChange={setCurrentStep} steps={steps} />

        {/* Main Content */}
        <div className="animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
          <CurrentStepComponent />
        </div>
      </div>
    </div>
  )
}
