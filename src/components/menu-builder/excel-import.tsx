"use client"

import type React from "react"
import { useState } from "react"
import { useMenuBuilder } from "./menu-builder-context"
import type { Product, Modifier, ModifierOption } from "./menu-builder-context"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../../hooks/use-toast"
import { X, Upload, Download, FileSpreadsheet, AlertCircle, HelpCircle } from "lucide-react"
import { Alert, AlertDescription } from "../ui/alert"
import * as XLSX from 'xlsx'

interface ExcelImportProps {
  onClose: () => void
}

export function ExcelImport({ onClose }: ExcelImportProps) {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [uploadedData, setUploadedData] = useState<Record<string, unknown>>({})

  // Función para crear plantilla Excel con modificadores OPCIONALES
  const createExcelTemplate = () => {
    // Hoja 1: Productos principales
    const productsData = [
      ['nombre', 'descripcion', 'precio', 'imagen'],
      ['Pizza Margherita', 'Salsa de tomate clásica con mozzarella fresca y albahaca', 12.99, ''],
      ['Ensalada César', 'Lechuga romana crujiente con parmesano y crutones', 8.50, ''],
      ['Salmón a la Parrilla', 'Salmón atlántico fresco con condimento de hierbas y limón', 18.99, ''],
      ['Hamburguesa Clásica', 'Carne de res con lechuga, tomate y cebolla', 14.50, '']
    ]

    // Hoja 2: Modificadores (todos OPCIONALES)
    const modifiersData = [
      ['producto_nombre', 'modificador_nombre', 'modificador_tipo', 'modificador_requerido', 'modificador_min', 'modificador_max', 'opcion_nombre', 'opcion_precio'],
      ['Pizza Margherita', 'Tamaño', 'single', 'NO', 0, 1, 'Personal (20cm)', 0],
      ['Pizza Margherita', 'Tamaño', 'single', 'NO', 0, 1, 'Mediana (30cm)', 3],
      ['Pizza Margherita', 'Tamaño', 'single', 'NO', 0, 1, 'Familiar (40cm)', 6],
      ['Pizza Margherita', 'Ingredientes Extra', 'multiple', 'NO', 0, 5, 'Queso Extra', 2],
      ['Pizza Margherita', 'Ingredientes Extra', 'multiple', 'NO', 0, 5, 'Pepperoni', 2.5],
      ['Pizza Margherita', 'Ingredientes Extra', 'multiple', 'NO', 0, 5, 'Champiñones', 1.5],
      ['Ensalada César', 'Proteína', 'single', 'NO', 0, 1, 'Pollo a la Parrilla', 4],
      ['Ensalada César', 'Proteína', 'single', 'NO', 0, 1, 'Camarones', 6],
      ['Ensalada César', 'Aderezo Extra', 'multiple', 'NO', 0, 3, 'César Extra', 0.5],
      ['Hamburguesa Clásica', 'Cocción', 'single', 'NO', 0, 1, 'Término Medio', 0],
      ['Hamburguesa Clásica', 'Cocción', 'single', 'NO', 0, 1, 'Bien Cocida', 0],
      ['Hamburguesa Clásica', 'Extras', 'multiple', 'NO', 0, 4, 'Tocino', 2],
      ['Hamburguesa Clásica', 'Extras', 'multiple', 'NO', 0, 4, 'Queso Cheddar', 1.5],
      ['Hamburguesa Clásica', 'Extras', 'multiple', 'NO', 0, 4, 'Aguacate', 2.5]
    ]

    // Hoja 3: Instrucciones
    const instructionsData = [
      ['INSTRUCCIONES PARA IMPORTACIÓN EXCEL'],
      [''],
      ['HOJA "Productos":'],
      ['- nombre: Nombre del producto (requerido)'],
      ['- descripcion: Descripción del producto'],
      ['- precio: Precio base del producto (requerido)'],
      ['- imagen: URL de la imagen (opcional)'],
      [''],
      ['HOJA "Modificadores":'],
      ['- producto_nombre: Debe coincidir exactamente con el nombre en la hoja Productos'],
      ['- modificador_nombre: Nombre del grupo de modificador (ej: "Tamaño", "Ingredientes")'],
      ['- modificador_tipo: "single" (una opción) o "multiple" (múltiples opciones)'],
      ['- modificador_requerido: "SI" o "NO" (recomendado: "NO" para mayor flexibilidad)'],
      ['- modificador_min: Número mínimo de opciones a seleccionar (generalmente 0)'],
      ['- modificador_max: Número máximo de opciones a seleccionar'],
      ['- opcion_nombre: Nombre de la opción específica'],
      ['- opcion_precio: Precio adicional de esta opción (puede ser 0)'],
      [''],
      ['EJEMPLOS:'],
      ['- Para un modificador de tamaño opcional: tipo="single", requerido="NO", min=0, max=1'],
      ['- Para ingredientes opcionales múltiples: tipo="multiple", requerido="NO", min=0, max=5'],
      [''],
      ['NOTAS IMPORTANTES:'],
      ['- Los nombres de productos deben ser exactamente iguales en ambas hojas'],
      ['- Cada fila en Modificadores representa UNA opción de UN modificador'],
      ['- Si un producto no tiene modificadores, no necesita aparecer en la hoja Modificadores'],
      ['- Los precios deben ser números (use punto decimal, ej: 12.99)'],
      ['- TODOS los modificadores son opcionales por defecto para mayor flexibilidad']
    ]

    // Crear workbook
    const wb = XLSX.utils.book_new()
    
    // Agregar hojas
    const wsProducts = XLSX.utils.aoa_to_sheet(productsData)
    const wsModifiers = XLSX.utils.aoa_to_sheet(modifiersData)
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData)
    
    XLSX.utils.book_append_sheet(wb, wsProducts, "Productos")
    XLSX.utils.book_append_sheet(wb, wsModifiers, "Modificadores")
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instrucciones")

    // Aplicar estilos básicos (ancho de columnas)
    wsProducts['!cols'] = [
      { width: 20 }, // nombre
      { width: 50 }, // descripcion
      { width: 10 }, // precio
      { width: 30 }  // imagen
    ]

    wsModifiers['!cols'] = [
      { width: 20 }, // producto_nombre
      { width: 20 }, // modificador_nombre
      { width: 15 }, // modificador_tipo
      { width: 15 }, // modificador_requerido
      { width: 12 }, // modificador_min
      { width: 12 }, // modificador_max
      { width: 25 }, // opcion_nombre
      { width: 12 }  // opcion_precio
    ]

    wsInstructions['!cols'] = [
      { width: 80 }
    ]

    // Descargar archivo
    XLSX.writeFile(wb, 'plantilla-importacion-productos.xlsx')

    toast({
      title: "Plantilla Descargada",
      description: "La plantilla Excel ha sido descargada con ejemplos y modificadores opcionales.",
    })
  }

  // Función para procesar archivo Excel
  const processExcelFile = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Leer hoja de productos
        const productsSheet = workbook.Sheets['Productos']
        if (!productsSheet) {
          throw new Error('No se encontró la hoja "Productos"')
        }
        const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 }) as unknown[][]
        
        // Leer hoja de modificadores (si existe)
        const modifiersSheet = workbook.Sheets['Modificadores']
        const modifiersData = modifiersSheet ? 
          XLSX.utils.sheet_to_json(modifiersSheet, { header: 1 }) as unknown[][] : []

        setUploadedData({ products: productsData, modifiers: modifiersData })
        
        toast({
          title: "Archivo Cargado",
          description: `Se cargaron ${productsData.length - 1} productos para importar.`,
        })
        
      } catch (error) {
        console.error('Error procesando Excel:', error)
        toast({
          title: "Error de Archivo",
          description: "No se pudo leer el archivo Excel. Verifica el formato.",
          variant: "destructive",
        })
      }
    }
    
    reader.readAsArrayBuffer(file)
  }

  // Función para importar datos
  const handleImport = () => {
    if (!uploadedData.products || uploadedData.products.length <= 1) {
      toast({
        title: "Sin Datos",
        description: "Por favor carga un archivo Excel primero.",
        variant: "destructive",
      })
      return
    }

    if (!selectedCategory) {
      toast({
        title: "Sin Categoría",
        description: "Por favor selecciona una categoría para los productos.",
        variant: "destructive",
      })
      return
    }

    try {
      const productsData = uploadedData.products
      const modifiersData = uploadedData.modifiers || []
      
      // Procesar productos
      const headers = productsData[0]
      const products = productsData.slice(1).filter((row: any[]) => row[0]) // Filtrar filas vacías

      // Crear mapa de modificadores por producto
      const modifiersMap: { [productName: string]: Modifier[] } = {}
      
      if (modifiersData.length > 1) {
        const modHeaders = modifiersData[0]
        const modRows = modifiersData.slice(1).filter((row: any[]) => row[0])
        
        modRows.forEach((row: any[]) => {
          const productName = row[0]
          const modifierName = row[1]
          const modifierType = row[2] as 'single' | 'multiple'
          const isRequired = row[3] === 'SI'
          const min = parseInt(row[4]) || 0
          const max = parseInt(row[5]) || 1
          const optionName = row[6]
          const optionPrice = parseFloat(row[7]) || 0

          if (!modifiersMap[productName]) {
            modifiersMap[productName] = []
          }

          // Buscar si ya existe este modificador
          let modifier = modifiersMap[productName].find(m => m.name === modifierName)
          
          if (!modifier) {
            modifier = {
              id: `mod-${Date.now()}-${Math.random()}`,
              name: modifierName,
              type: modifierType,
              required: isRequired,
              min,
              max,
              options: []
            }
            modifiersMap[productName].push(modifier)
          }

          // Agregar opción al modificador
          modifier.options.push({
            id: `opt-${Date.now()}-${Math.random()}`,
            name: optionName,
            price: optionPrice
          })
        })
      }

      let successCount = 0
      let errorCount = 0

      // Crear productos
      products.forEach((row: any[], index: number) => {
        try {
          const productName = row[0]
          const description = row[1] || ""
          const price = parseFloat(row[2]) || 0
          const image = row[3] || ""

          if (!productName || !price) {
            throw new Error(`Faltan campos requeridos en la fila ${index + 2}`)
          }

          const product: Product = {
            id: `product-${Date.now()}-${index}`,
            name: productName,
            description,
            price,
            categoryId: selectedCategory,
            modifiers: modifiersMap[productName] || [],
            order: state.products.length + index,
            image
          }

          dispatch({ type: "ADD_PRODUCT", payload: product })
          successCount++
        } catch (error) {
          console.error(`Error importando producto en la fila ${index + 2}:`, error)
          errorCount++
        }
      })

      toast({
        title: "Importación Completa",
        description: `Se importaron ${successCount} productos exitosamente. ${errorCount > 0 ? `${errorCount} errores.` : ""}`,
      })

      if (successCount > 0) {
        onClose()
      }

    } catch (error) {
      console.error('Error en importación:', error)
      toast({
        title: "Error de Importación",
        description: "Error procesando el archivo Excel.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-in-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-montserrat flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importación Masiva desde Excel
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Categoría */}
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

          {/* Descarga de plantilla */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Descarga la plantilla Excel que incluye ejemplos de productos con modificadores opcionales.
              La plantilla tiene 3 hojas: Productos, Modificadores e Instrucciones.
              <Button variant="link" onClick={createExcelTemplate} className="ml-2 p-0 h-auto">
                <Download className="h-4 w-4 mr-1" />
                Descargar Plantilla Excel
              </Button>
            </AlertDescription>
          </Alert>

          {/* Información sobre modificadores */}
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Manejo de Modificadores en Excel:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Usa la hoja "Modificadores" para definir opciones como tamaños, ingredientes extra, etc.</li>
                <li>Cada fila representa una opción específica de un modificador</li>
                <li>Puedes tener modificadores de "single" (una opción) o "multiple" (varias opciones)</li>
                <li>Todos los modificadores son opcionales por defecto (requerido="NO")</li>
                <li>Los nombres de productos deben coincidir exactamente entre ambas hojas</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Subida de archivo */}
          <div className="space-y-2">
            <Label>Subir Archivo Excel</Label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) processExcelFile(file)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full bg-transparent">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Elegir Archivo Excel (.xlsx)
              </Button>
            </div>
          </div>

          {/* Preview de datos cargados */}
          {uploadedData.products && uploadedData.products.length > 1 && (
            <div className="space-y-2">
              <Label>Vista Previa de Datos</Label>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-auto">
                <p className="text-sm mb-2">
                  <strong>Productos encontrados:</strong> {uploadedData.products.length - 1}
                </p>
                <p className="text-sm mb-2">
                  <strong>Modificadores encontrados:</strong> {uploadedData.modifiers ? uploadedData.modifiers.length - 1 : 0}
                </p>
                <pre className="text-xs">
                  {uploadedData.products.slice(0, 4).map((row: any[], i: number) => 
                    i === 0 ? `${row.join(' | ')} (HEADERS)` : `${row.join(' | ')}`
                  ).join('\n')}
                  {uploadedData.products.length > 4 && '\n...más productos...'}
                </pre>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!uploadedData.products || uploadedData.products.length <= 1 || !selectedCategory}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Productos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
