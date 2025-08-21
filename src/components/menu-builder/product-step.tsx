"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { useMenuBuilder } from "./menu-builder-context"
import { BulkImport } from "./bulk-import"
import { ChefHat, Plus, Edit2, Trash2, Upload, Package, FolderPlus } from "lucide-react"
import { useToast } from "../../hooks/use-toast"
import type { Category } from "./menu-builder-context"

export function ProductStep() {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all")
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
    setSelectedCategory(newCategory.id.toString())

    toast({
      title: "Éxito",
      description: "Categoría creada exitosamente",
    })
  }

  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      dispatch({ type: "DELETE_PRODUCT", payload: id })
      toast({
        title: "Éxito",
        description: "Producto eliminado exitosamente",
      })
    }
  }

  const handleAddProduct = () => {
    const categoryParam = selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
    router.push(`/agregar-producto${categoryParam}`)
  }

  const handleEditProduct = (productId: number) => {
    router.push(`/agregar-producto?id=${productId}`)
  }

  const filteredProducts =
    selectedCategory !== "all" ? state.products.filter((p) => p.categoryId === Number(selectedCategory)) : state.products

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-montserrat">
            <ChefHat className="w-6 h-6 text-primary" />
            <span>Construye tu Menú</span>
          </CardTitle>
          <CardDescription className="font-open-sans">
            Crea categorías y agrega productos con descripciones, precios, imágenes y modificadores personalizados.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-montserrat">
            <span className="flex items-center space-x-2">
              <FolderPlus className="w-5 h-5 text-primary" />
              <span>Categorías</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowCategoryForm(!showCategoryForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCategoryForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryName" className="font-open-sans">
                    Nombre de la Categoría
                  </Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ej: Entradas, Platos Principales..."
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription" className="font-open-sans">
                    Descripción (Opcional)
                  </Label>
                  <Input
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Descripción breve de la categoría"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateCategory}>Crear Categoría</Button>
                <Button variant="outline" onClick={() => setShowCategoryForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {state.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-open-sans">Aún no hay categorías. Crea tu primera categoría para comenzar.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {state.categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer font-open-sans"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({state.products.filter((p) => p.categoryId === category.id).length})
                </Badge>
              ))}
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer font-open-sans"
                onClick={() => setSelectedCategory("all")}
              >
                Todas ({state.products.length})
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {state.categories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddProduct} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImport(true)} className="flex-1 sm:flex-none">
            <Upload className="w-4 h-4 mr-2" />
            Importación Masiva
          </Button>
        </div>
      )}

      {/* Products List */}
      {state.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat">
              Productos
              {selectedCategory !== "all" && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  en {state.categories.find((c) => c.id === Number(selectedCategory))?.name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-open-sans">
                  {selectedCategory !== "all"
                    ? "Aún no hay productos en esta categoría."
                    : "Aún no se han agregado productos."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts
                  .sort((a, b) => a.order - b.order)
                  .map((product) => {
                    const category = state.categories.find((c) => c.id === product.categoryId)

                    return (
                      <div
                        key={product.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors animate-slide-in-right"
                      >
                        <div className="flex space-x-4 flex-1">
                          {product.image && (
                            <div 
                              className="w-16 h-16 rounded-lg bg-cover bg-center bg-gray-200"
                              style={{ backgroundImage: `url(${product.image || "/placeholder.svg"})` }}
                              role="img"
                              aria-label={product.name}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold font-montserrat">{product.name}</h3>
                              <Badge variant="outline" className="text-xs font-open-sans">
                                {category?.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 font-open-sans">{product.description}</p>
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold text-primary font-montserrat">
                                L {product.price.toFixed(2)}
                              </span>
                              {product.modifiers.length > 0 && (
                                <Badge variant="secondary" className="text-xs font-open-sans">
                                  {product.modifiers.length} modificadores
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product.id)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && <BulkImport onClose={() => setShowBulkImport(false)} />}
    </div>
  )
}
