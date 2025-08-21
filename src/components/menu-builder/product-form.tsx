"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Category, Product, Modifier, ModifierOption } from "./menu-builder-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Switch } from "../../components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { useToast } from "../../hooks/use-toast"
import { Plus, Trash2, X, Info, HelpCircle, Image, Eye, Calculator } from "lucide-react"

interface ProductFormProps {
  categories: Category[]
  onSave: (productData: Omit<Product, 'id' | 'order'>) => void
  onCancel: () => void
  initialProduct?: Product
  defaultCategoryId?: string
  showButtons?: boolean
}

export function ProductForm({
  categories,
  onSave,
  onCancel,
  initialProduct,
  defaultCategoryId,
  showButtons = true,
}: ProductFormProps) {
  const { toast } = useToast()

  const safeCategories = categories || []

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    isv: 15, // Impuesto sobre venta por defecto 15%
    categoryId: defaultCategoryId || (safeCategories.length > 0 ? safeCategories[0].id : ""),
    image: "",
    available: true,
    modifiers: [] as Modifier[],
  })

  const [imagePreview, setImagePreview] = useState<string>("")
  const [hasModifiers, setHasModifiers] = useState(false)

  const [currentModifier, setCurrentModifier] = useState<{
    name: string
    modifierType: "single" | "multiple"
    required: boolean
    min: number
    max: number
    options: ModifierOption[]
  }>({
    name: "",
    modifierType: "single",
    required: false,
    min: 0,
    max: 1,
    options: []
  })

  const [newOption, setNewOption] = useState({ name: "", price: 0 })

  const isEditing = !!initialProduct

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        description: initialProduct.description || "",
        price: initialProduct.price,
        isv: 15,
        categoryId: initialProduct.categoryId,
        image: initialProduct.image || "",
        available: true,
        modifiers: initialProduct.modifiers || [],
      })
      setImagePreview(initialProduct.image || "")
      setHasModifiers(initialProduct.modifiers && initialProduct.modifiers.length > 0)
    }
  }, [initialProduct])

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }))
    setImagePreview(url)
  }

  const calculateTotalPrice = () => {
    const base = formData.price || 0
    const isvAmount = base * (formData.isv / 100)
    return base + isvAmount
  }

  const handleModifiersToggle = (enabled: boolean) => {
    setHasModifiers(enabled)
    if (!enabled) {
      // Limpiar modificadores si se deshabilita
      setFormData(prev => ({ ...prev, modifiers: [] }))
      setCurrentModifier({
        name: "",
        modifierType: "single",
        required: false,
        min: 0,
        max: 1,
        options: []
      })
      setNewOption({ name: "", price: 0 })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (safeCategories.length === 0) {
      toast({
        title: "Error",
        description: "Debes crear al menos una categoría antes de agregar productos.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim() || !formData.categoryId || formData.price <= 0) {
      toast({
        title: "Error de Validación",
        description: "Por favor completa todos los campos requeridos con valores válidos.",
        variant: "destructive",
      })
      return
    }

    const productData = {
      ...formData,
      order: isEditing ? initialProduct?.order || 0 : 0,
    }

    onSave(productData)
    
    // Reset form if not editing
    if (!isEditing) {
      resetForm()
      toast({
        title: "¡Éxito!",
        description: "Producto agregado correctamente. Puedes seguir agregando más.",
      })
    }
  }

  const addOptionToCurrentModifier = () => {
    if (newOption.name.trim()) {
      const option: ModifierOption = {
        id: `option-${Date.now()}-${Math.random()}`,
        name: newOption.name.trim(),
        price: newOption.price,
      }
      
      // Si no hay nombre de modificador, crear uno automático
      const modifierName = currentModifier.name.trim() || "Opciones"
      
      // Buscar si ya existe el modificador
      const existingModifierIndex = formData.modifiers.findIndex(m => m.name === modifierName)
      
      if (existingModifierIndex >= 0) {
        // Agregar opción a modificador existente
        const updatedModifiers = [...formData.modifiers]
        updatedModifiers[existingModifierIndex] = {
          ...updatedModifiers[existingModifierIndex],
          options: [...updatedModifiers[existingModifierIndex].options, option]
        }
        setFormData(prev => ({ ...prev, modifiers: updatedModifiers }))
      } else {
        // Crear nuevo modificador
        const newModifier: Modifier = {
          id: `modifier-${Date.now()}`,
          name: modifierName,
          type: currentModifier.modifierType,
          required: currentModifier.required,
          min: currentModifier.min,
          max: currentModifier.max,
          options: [option],
        }
        setFormData(prev => ({ ...prev, modifiers: [...prev.modifiers, newModifier] }))
      }
      
      setNewOption({ name: "", price: 0 })
      toast({
        title: "Éxito",
        description: "Opción agregada correctamente",
      })
    }
  }

  const removeOptionFromCurrentModifier = (optionId: string) => {
    setCurrentModifier(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId)
    }))
  }

  const clearCurrentModifier = () => {
    setCurrentModifier({
      name: "",
      modifierType: "single",
      required: false,
      min: 0,
      max: 1,
      options: []
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      isv: 15,
      categoryId: defaultCategoryId || (safeCategories.length > 0 ? safeCategories[0].id : ""),
      image: "",
      available: true,
      modifiers: [],
    })
    setImagePreview("")
    clearCurrentModifier()
  }

  const removeModifier = (modifierId: string) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((m) => m.id !== modifierId),
    }))
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Columna de Consejos (30%) */}
      <div className="col-span-4 space-y-4">
        <Card className="bg-blue-50 border-blue-200 sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Consejos y Ejemplos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <h3 className="font-semibold text-blue-700 text-sm mb-2">Sobre los Productos:</h3>
              <p className="text-blue-600 text-sm mb-3">
                Los productos son los elementos que venderás a tus clientes.
              </p>
            </div>
            
            <div className="bg-blue-100 border-l-4 border-blue-500 p-3">
              <h3 className="font-semibold text-blue-700 text-sm mb-1">Tips importantes:</h3>
              <ul className="text-xs text-blue-600 space-y-1 ml-3">
                <li className="list-disc"><strong>Nombre claro</strong> y descriptivo</li>
                <li className="list-disc"><strong>Descripción detallada</strong> con ingredientes</li>
                <li className="list-disc"><strong>Imagen atractiva</strong> aumenta ventas</li>
                <li className="list-disc"><strong>Precio competitivo</strong> y rentable</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
              <h3 className="font-semibold text-yellow-700 text-sm mb-1">Modificadores:</h3>
              <ul className="text-xs text-yellow-600 space-y-1 ml-3">
                <li className="list-disc"><strong>Único:</strong> Solo una opción (ej: tamaños)</li>
                <li className="list-disc"><strong>Múltiple:</strong> Varias opciones (ej: extras)</li>
                <li className="list-disc"><strong>Min/Max:</strong> Controla selección</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-3">
              <h3 className="font-semibold text-green-700 text-sm mb-1">Ejemplos:</h3>
              <div className="text-xs text-green-600 space-y-1">
                <p><strong>Bebida:</strong> Pequeño (+L.0), Grande (+L.15)</p>
                <p><strong>Pizza:</strong> Queso extra (+L.25), Jamón (+L.30)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna de Formulario (70%) */}
      <div className="col-span-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Hamburguesa Clásica"
                  className="border-red-200 focus:border-red-400 focus:ring-red-200"
                  required
                />
                <p className="text-xs text-gray-500">Nombre claro y descriptivo del producto</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeCategories.length > 0 ? (
                      safeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Primero debes crear categorías en el menú principal</p>
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del producto"
                  rows={3}
                  className="border-red-200 focus:border-red-400 focus:ring-red-200"
                />
                <p className="text-xs text-gray-500">Incluye ingredientes y detalles importantes</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio Base (Lempiras) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">L.</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                      className="pl-8 border-red-200 focus:border-red-400 focus:ring-red-200"
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Precio sin impuesto</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isv">ISV (%) *</Label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="isv"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.isv}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isv: Number.parseFloat(e.target.value) || 0 }))}
                      className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-200"
                      placeholder="15"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Impuesto sobre venta</p>
                </div>

                <div className="space-y-2">
                  <Label>Precio Total</Label>
                  <div className="flex items-center h-10 px-3 border border-gray-200 rounded-md bg-gray-50">
                    <span className="font-semibold text-green-600">L. {calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Precio final con ISV</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleImageChange(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="border-red-200 focus:border-red-400 focus:ring-red-200"
                  />
                  <p className="text-xs text-gray-500">Enlace a una imagen (recomendado)</p>
                </div>

                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="h-24 border-2 border-dashed border-red-200 rounded-lg p-2 flex items-center justify-center bg-gray-50">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="h-full w-full object-cover rounded"
                        onError={() => setImagePreview("")}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Image className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
                />
                <Label htmlFor="available">Disponible para pedidos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasModifiers"
                  checked={hasModifiers}
                  onCheckedChange={handleModifiersToggle}
                />
                <Label htmlFor="hasModifiers" className="flex items-center gap-2">
                  Este producto tiene modificadores
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Los modificadores permiten personalizar el producto (Ej: tamaños, extras, opciones)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
              </div>
          </CardContent>
        </Card>

          {/* Modifier Creation */}
          {hasModifiers && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Modificadores del Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Agrega opciones como tamaños, extras o personalizaciones. Al escribir una opción se guarda automáticamente.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="modifier-name">Nombre del Modificador</Label>
                      <Input
                        id="modifier-name"
                        value={currentModifier.name}
                        onChange={(e) => setCurrentModifier(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Tamaño, Ingredientes Extra"
                        className="border-red-200 focus:border-red-400 focus:ring-red-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Si está vacío, se usará "Opciones"</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="modifier-min">Mínimo</Label>
                        <Input
                          id="modifier-min"
                          type="number"
                          min="0"
                          value={currentModifier.min}
                          onChange={(e) => setCurrentModifier(prev => ({ ...prev, min: Number.parseInt(e.target.value) || 0 }))}
                          className="border-red-200 focus:border-red-400 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="modifier-max">Máximo</Label>
                        <Input
                          id="modifier-max"
                          type="number"
                          min="1"
                          value={currentModifier.max}
                          onChange={(e) => setCurrentModifier(prev => ({ ...prev, max: Number.parseInt(e.target.value) || 1 }))}
                          className="border-red-200 focus:border-red-400 focus:ring-red-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Tipo</Label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="modifier-type"
                            checked={currentModifier.modifierType === "single"}
                            onChange={() => setCurrentModifier(prev => ({ ...prev, modifierType: "single" }))}
                            className="text-red-500 focus:ring-red-200"
                          />
                          <span className="ml-2 text-sm">Único</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="modifier-type"
                            checked={currentModifier.modifierType === "multiple"}
                            onChange={() => setCurrentModifier(prev => ({ ...prev, modifierType: "multiple" }))}
                            className="text-red-500 focus:ring-red-200"
                          />
                          <span className="ml-2 text-sm">Múltiple</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentModifier.required}
                        onCheckedChange={(checked) => setCurrentModifier(prev => ({ ...prev, required: checked }))}
                      />
                      <Label className="text-sm">Modificador requerido</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Agregar Opciones</Label>
                      <p className="text-sm text-gray-600 mb-3">Las opciones se guardan automáticamente al agregarlas</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Input
                          value={newOption.name}
                          onChange={(e) => setNewOption(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Grande, Queso Extra"
                          className="border-red-200 focus:border-red-400 focus:ring-red-200"
                          onKeyPress={(e) => e.key === 'Enter' && addOptionToCurrentModifier()}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newOption.price}
                          onChange={(e) => setNewOption(prev => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                          placeholder="L. 0.00"
                          className="border-red-200 focus:border-red-400 focus:ring-red-200"
                          onKeyPress={(e) => e.key === 'Enter' && addOptionToCurrentModifier()}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={addOptionToCurrentModifier} 
                      className="w-full bg-red-500 hover:bg-red-600" 
                      disabled={!newOption.name.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Opción
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Existing Modifiers */}
          {formData.modifiers.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Modificadores del Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.modifiers.map((modifier) => (
                    <div key={modifier.id} className="border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{modifier.name}</span>
                          <Badge variant={modifier.type === "single" ? "default" : "secondary"}>
                            {modifier.type === "single" ? "Único" : "Múltiple"}
                          </Badge>
                          {modifier.required && <Badge variant="destructive">Requerido</Badge>}
                          <Badge variant="outline">{modifier.min}-{modifier.max}</Badge>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeModifier(modifier.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {modifier.options.map((option) => (
                          <div key={option.id} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {option.name} {option.price > 0 && `(+L. ${option.price})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {showButtons && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-500 hover:bg-red-600">
                {isEditing ? "Actualizar Producto" : "Agregar Producto"}
              </Button>
            </div>
          )}
          </form>
        </div>
      </div>
  )
}
