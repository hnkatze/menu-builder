"use client"

import type React from "react"

import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"
import { Check, ChefHat, Eye, Download, FolderOpen } from "lucide-react"

interface Step {
  id: number
  title: string
  component: React.ComponentType
}

interface StepNavigationProps {
  currentStep: number
  onStepChange: (step: number) => void
  steps: Step[]
}

const stepIcons = {
  1: FolderOpen,
  2: ChefHat,
  3: Eye,
  4: Download,
}

export function StepNavigation({ currentStep, onStepChange, steps }: StepNavigationProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4 bg-card rounded-xl p-2 shadow-lg border">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.id as keyof typeof stepIcons]
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <div key={step.id} className="flex items-center">
              <Button
                variant={isActive ? "default" : "ghost"}
                size="lg"
                onClick={() => onStepChange(step.id)}
                className={cn(
                  "relative transition-all duration-300 font-montserrat font-semibold",
                  isActive && "bg-primary text-primary-foreground shadow-lg animate-pulse-glow",
                  isCompleted && !isActive && "bg-secondary text-secondary-foreground",
                  "hover:scale-105",
                )}
              >
                <div className="flex items-center space-x-2">
                  {isCompleted && !isActive ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  <span className="hidden sm:inline">
                    {step.id}. {step.title}
                  </span>
                  <span className="sm:hidden">{step.id}</span>
                </div>
              </Button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-2 transition-colors duration-300",
                    currentStep > step.id ? "bg-secondary" : "bg-border",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
