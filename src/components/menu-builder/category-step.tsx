"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Textarea } from "../../components/ui/textarea"
import { useMenuBuilder } from "./menu-builder-context"
import { BulkImport } from "./bulk-import"
import { ChefHat, Plus, Edit2, Trash2, Upload, Package, FolderPlus, ArrowRight } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import type { Category } from "./menu-builder-context"

export function CategoryStep() {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const router = useRouter()
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      })
      return
    }

    const newCategory: Category = {
      id: Date.now(),
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      order: state.categories.length,
    }

    dispatch({ type: "ADD_CATEGORY", payload: newCategory })
    setCategoryName("")
    setCategoryDescription("")
    setShowCategoryForm(false)

    toast({
      title: "Éxito",
      description: "Categoría creada correctamente",
    })
  }

  const handleDeleteCategory = (categoryId: number) => {
    dispatch({ type: "DELETE_CATEGORY", payload: categoryId })
    toast({
      title: "Categoría eliminada",
      description: "La categoría y sus productos han sido eliminados",
    })
  }

  const getCategoryProducts = (categoryId: number) => {
    return state.products.filter((product) => product.categoryId === categoryId)
  }

  const goToAddProducts = (categoryId: number) => {
    router.push(`/agregar-producto?category=${categoryId}`)
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Gestión de Categorías y Productos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-blue-600 mb-3">
            Organiza tu menú creando categorías y luego agrega productos a cada una. Las categorías te ayudan a estructurar tu menú de forma clara y profesional.
          </p>
          <div className="bg-blue-100 border-l-4 border-blue-500 p-3">
            <h3 className="font-semibold text-blue-700 text-sm mb-1">Flujo recomendado:</h3>
            <ol className="text-sm text-blue-600 space-y-1 ml-3 list-decimal">
              <li>Crea categorías para organizar tu menú</li>
              <li>Haz clic en &quot;Agregar Productos&quot; para cada categoría</li>
              <li>Usa importación masiva si tienes muchos productos</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Category Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Crear Nueva Categoría
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importación Masiva
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCategoryForm ? (
            <Button onClick={() => setShowCategoryForm(true)} className="w-full bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nombre de la Categoría *</Label>
                  <Input
                    id="category-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ej: Bebidas, Comidas, Postres"
                    className="border-red-200 focus:border-red-400 focus:ring-red-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Descripción (Opcional)</Label>
                  <Input
                    id="category-description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Descripción breve de la categoría"
                    className="border-red-200 focus:border-red-400 focus:ring-red-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCategory} className="flex-1 bg-red-500 hover:bg-red-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Categoría
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCategoryForm(false)
                    setCategoryName("")
                    setCategoryDescription("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories List */}
      {state.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Categorías del Menú
              <Badge variant="secondary">{state.categories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {state.categories.map((category) => {
                const productCount = getCategoryProducts(category.id).length
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <Badge variant="outline">{productCount} productos</Badge>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => goToAddProducts(category.id)}
                        className="bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Agregar Productos
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {state.categories.length === 0 && (
        <Card className="text-center p-8">
          <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay categorías</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primera categoría para organizar tu menú</p>
          <Button onClick={() => setShowCategoryForm(true)} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Categoría
          </Button>
        </Card>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImport
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}