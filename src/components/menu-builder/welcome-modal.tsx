"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChefHat, Sparkles, Download, Zap } from "lucide-react"

interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      icon: ChefHat,
      title: "Bienvenido al Constructor de Menús",
      description: "Crea hermosos menús interactivos para restaurantes con nuestra guía paso a paso.",
      features: ["Interfaz de Arrastrar y Soltar", "Vista Previa en Tiempo Real", "Plantillas Profesionales"],
    },
    {
      icon: Sparkles,
      title: "Funciones Inteligentes",
      description: "Agrega modificadores, organiza categorías y personaliza cada detalle de tu menú.",
      features: ["Modificadores Personalizados", "Importación/Exportación Masiva", "Guardado Automático"],
    },
    {
      icon: Download,
      title: "Exportar y Compartir",
      description: "Descarga tu menú como JSON o compártelo directamente con tu equipo.",
      features: ["Exportación JSON", "Almacenamiento Local", "Integración Fácil"],
    },
  ]

  const currentSlideData = slides[currentSlide]
  const Icon = currentSlideData.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-bounce-in">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>

          <CardTitle className="text-center font-montserrat">{currentSlideData.title}</CardTitle>
          <CardDescription className="text-center font-open-sans">{currentSlideData.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {currentSlideData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="text-sm font-open-sans">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 py-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            {currentSlide > 0 && (
              <Button variant="outline" onClick={() => setCurrentSlide(currentSlide - 1)} className="flex-1">
                Anterior
              </Button>
            )}

            {currentSlide < slides.length - 1 ? (
              <Button onClick={() => setCurrentSlide(currentSlide + 1)} className="flex-1">
                Siguiente
              </Button>
            ) : (
              <Button onClick={onClose} className="flex-1">
                Comenzar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
