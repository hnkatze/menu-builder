"use client"

import type React from "react"

import { useState } from "react"
import { useMenuBuilder } from "./menu-builder-context"
import type { Product } from "./menu-builder-context"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from "../../hooks/use-toast"
import { X, Upload, Download, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"

interface BulkImportProps {
  onClose: () => void
}

export function BulkImport({ onClose }: BulkImportProps) {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const [importData, setImportData] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [importMethod, setImportMethod] = useState<"csv" | "json">("csv")

  const csvTemplate = `nombre,descripcion,precio,alergenos,dietetico
"Pizza Margherita","Salsa de tomate clásica con mozzarella fresca y albahaca",12.99,"Gluten, Lácteos","Vegetariano"
"Ensalada César","Lechuga romana crujiente con parmesano y crutones",8.50,"Gluten, Lácteos, Huevos",""
"Salmón a la Parrilla","Salmón atlántico fresco con condimento de hierbas y limón",18.99,"Pescado","Sin Gluten"`

  const jsonTemplate = `[
  {
    "nombre": "Pizza Margherita",
    "descripcion": "Salsa de tomate clásica con mozzarella fresca y albahaca",
    "precio": 12.99,
    "alergenos": ["Gluten", "Lácteos"],
    "dietetico": ["Vegetariano"]
  },
  {
    "nombre": "Ensalada César", 
    "descripcion": "Lechuga romana crujiente con parmesano y crutones",
    "precio": 8.50,
    "alergenos": ["Gluten", "Lácteos", "Huevos"],
    "dietetico": []
  }
]`

  const downloadTemplate = () => {
    const template = importMethod === "csv" ? csvTemplate : jsonTemplate
    const blob = new Blob([template], { type: importMethod === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `plantilla-importacion-masiva.${importMethod}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Plantilla Descargada",
      description: `La plantilla ${importMethod.toUpperCase()} ha sido descargada.`,
    })
  }

  const parseCSV = (csvText: string): Partial<Product>[] => {
    const lines = csvText.trim().split("\n")
    
    // Parse CSV properly handling quoted fields with commas
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = []
      let current = ""
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      
      values.push(current.trim())
      return values
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, "").trim())

    return lines.slice(1).filter(line => line.trim()).map((line) => {
      const values = parseCSVLine(line).map((v) => v.replace(/"/g, "").trim())
      const product: Partial<Product> = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""
        switch (header.toLowerCase()) {
          case "nombre":
            product.name = value
            break
          case "descripcion":
            product.description = value
            break
          case "precio":
            product.price = Number.parseFloat(value) || 0
            break
        }
      })

      return product
    })
  }

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "Sin Datos",
        description: "Por favor pega tus datos de importación primero.",
        variant: "destructive",
      })
      return
    }

    if (!selectedCategory) {
      toast({
        title: "Sin Categoría Seleccionada",
        description: "Por favor selecciona una categoría para los productos importados.",
        variant: "destructive",
      })
      return
    }

    try {
      let products: Partial<Product>[] = []

      if (importMethod === "csv") {
        products = parseCSV(importData)
      } else {
        products = JSON.parse(importData)
      }

      if (!Array.isArray(products)) {
        throw new Error("Los datos deben ser un array de productos")
      }

      let successCount = 0
      let errorCount = 0

      products.forEach((productData, index) => {
        try {
          if (!productData.name || !productData.price) {
            throw new Error(`Faltan campos requeridos (nombre, precio) en la fila ${index + 1}`)
          }

          const product = {
            id: `product-${Date.now()}-${index}`,
            name: productData.name,
            description: productData.description || "",
            price: Number.parseFloat(String(productData.price)) || 0,
            categoryId: selectedCategory,
            modifiers: [],
            order: state.products.length + index,
            image: productData.image || "",
          }

          dispatch({ type: "ADD_PRODUCT", payload: product })
          successCount++
        } catch (error) {
          console.error(`Error importando producto en la fila ${index + 1}:`, error)
          errorCount++
        }
      })

      toast({
        title: "Importación Completa",
        description: `Se importaron exitosamente ${successCount} productos. ${errorCount > 0 ? `${errorCount} errores ocurrieron.` : ""}`,
      })

      if (successCount > 0) {
        onClose()
      }
    } catch {
      toast({
        title: "Error de Importación",
        description: `Error analizando datos ${importMethod.toUpperCase()}. Por favor verifica el formato.`,
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-in-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-montserrat flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importación Masiva de Productos
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Import Method Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formato de Importación</Label>
              <Select value={importMethod} onValueChange={(value: "csv" | "json") => setImportMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Formato CSV</SelectItem>
                  <SelectItem value="json">Formato JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría Destino</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {state.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Download */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Descarga el archivo de plantilla para ver el formato requerido para la importación masiva.
              <Button variant="link" onClick={downloadTemplate} className="ml-2 p-0 h-auto">
                <Download className="h-4 w-4 mr-1" />
                Descargar Plantilla {importMethod.toUpperCase()}
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Subir Archivo</Label>
            <div className="relative">
              <input
                type="file"
                accept={importMethod === "csv" ? ".csv" : ".json"}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Elegir Archivo {importMethod.toUpperCase()}
              </Button>
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label>O Pegar Datos Manualmente</Label>
            <Textarea
              value={importData}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportData(e.target.value)}
              placeholder={`Pega tus datos ${importMethod.toUpperCase()} aquí...`}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Template Preview */}
          <div className="space-y-2">
            <Label>Ejemplo de Plantilla</Label>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-40 font-mono">
              {importMethod === "csv" ? csvTemplate : jsonTemplate}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Productos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
