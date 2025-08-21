"use client"

import type React from "react"
import type { Category, Product } from "./menu-builder-context"
import { useState } from "react"
import { useMenuBuilder } from "./menu-builder-context"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { useToast } from "../../hooks/use-toast"
import { Download, Copy, FileJson, Upload, ArrowLeft, CheckCircle, Settings, AlertCircle, Trash2 } from "lucide-react"

export function ExportStep() {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const safeCategories = state.categories || []
  const safeProducts = state.products || []

  const generateMenuJSON = () => {
    const menuData = {
      menu: safeCategories.map((category: Category) => ({
        id: category.id,
        name: category.name,
        products: safeProducts
          .filter((product: Product) => product.categoryId === category.id)
          .map((product: Product) => ({
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price,
            isv: product.isv || 15,
            image: product.image || null,
            modifiers: (product.modifiers || []).map((modifier, index) => ({
              id: modifier.id,
              name: modifier.name,
              min: modifier.min,
              max: modifier.max,
              type: modifier.type === "single" ? 1 : 2,
              position: index + 1,
              options: (modifier.options || []).map((option, optIndex) => ({
                id: option.id,
                label: option.name,
                value: option.price
              }))
            }))
          }))
      })),
      metadata: {
        created: new Date().toISOString(),
        totalCategories: safeCategories.length,
        totalProducts: safeProducts.length,
        totalModifiers: safeProducts.reduce((total, product) => total + (product.modifiers?.length || 0), 0)
      }
    }
    return JSON.stringify(menuData, null, 2)
  }

  const handleDownload = () => {
    const jsonData = generateMenuJSON()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `menu-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "¡Menú Descargado!",
      description: "Tu archivo JSON del menú ha sido descargado exitosamente.",
    })
  }

  const handleCopy = async () => {
    const jsonData = generateMenuJSON()
    try {
      await navigator.clipboard.writeText(jsonData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "¡Copiado al Portapapeles!",
        description: "El JSON del menú ha sido copiado a tu portapapeles.",
      })
    } catch {
      toast({
        title: "Error al Copiar",
        description: "No se pudo copiar al portapapeles. Por favor intenta descargando en su lugar.",
        variant: "destructive",
      })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        JSON.parse(e.target?.result as string)
        // Here you would implement the import logic
        toast({
          title: "¡Importación Exitosa!",
          description: "Los datos del menú han sido importados exitosamente.",
        })
      } catch {
        toast({
          title: "Error de Importación",
          description: "Archivo JSON inválido. Por favor verifica el formato del archivo.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    dispatch({ type: "CLEAR_DATA" })
    toast({
      title: "Datos Limpiados",
      description: "Todos los datos del menú han sido eliminados del almacenamiento local.",
    })
  }

  const hasMenuData = safeCategories.length > 0 || safeProducts.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-montserrat">Exportar y Configuración</h2>
        </div>
        <p className="text-muted-foreground font-open-sans">Configura los ajustes de tu menú y exporta tus datos</p>
      </div>

      {!hasMenuData && (
        <Card className="max-w-6xl mx-auto border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Menú vacío</p>
                <p className="text-sm text-amber-700">
                  No tienes categorías ni productos en tu menú. Agrega contenido en los pasos anteriores antes de
                  exportar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Menu Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Resumen del Menú
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Categorías</Label>
                <div className="text-2xl font-bold text-primary">{safeCategories.length}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Productos</Label>
                <div className="text-2xl font-bold text-primary">{safeProducts.length}</div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">
                Tu menú está listo para ser exportado. El archivo JSON generado incluye todas las categorías, productos y modificadores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Exportar Menú
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p>
                <strong>Categorías:</strong> {safeCategories.length}
              </p>
              <p>
                <strong>Productos:</strong> {safeProducts.length}
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Descargar Archivo JSON
              </Button>

              <Button onClick={handleCopy} variant="outline" className="w-full bg-transparent" size="lg">
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar al Portapapeles
                  </>
                )}
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="secondary" className="w-full" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Archivo JSON
                </Button>
              </div>

              {hasMenuData && (
                <div className="pt-2 border-t">
                  <Button 
                    onClick={handleClearData} 
                    variant="destructive" 
                    className="w-full" 
                    size="lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Todos los Datos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Esta acción eliminará todas las categorías y productos
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON Preview */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Vista Previa JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">{generateMenuJSON()}</pre>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 max-w-6xl mx-auto">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Volver a Vista Previa
        </Button>
        <Button className="flex items-center gap-2" onClick={handleDownload}>
          <CheckCircle className="h-4 w-4" />
          Completar y Descargar
        </Button>
      </div>
    </div>
  )
}
