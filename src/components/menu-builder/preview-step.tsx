"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Category, Product } from "./menu-builder-context"
import { useMenuBuilder } from "./menu-builder-context"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { BulkImport } from "./bulk-import"
import { useToast } from "../../hooks/use-toast"
import { Eye, ArrowLeft, ArrowRight, Package, Plus, ChefHat, FolderPlus, Upload, Trash2, ChevronLeft, ChevronRight, HelpCircle, Info, Edit2 } from "lucide-react"

export function PreviewStep() {
  const { state, dispatch } = useMenuBuilder()
  const { toast } = useToast()
  const router = useRouter()
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 5

  const safeCategories = state.categories || []
  const safeProducts = state.products || []

  // Auto-seleccionar la primera categoría si existe y no hay una seleccionada
  if (safeCategories.length > 0 && !selectedCategoryId) {
    setSelectedCategoryId(safeCategories[0].id)
  }

  const getCategoryProducts = (categoryId: string) => {
    return safeProducts.filter((product: Product) => product.categoryId === categoryId)
  }

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
      id: `category-${Date.now()}`,
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      order: state.categories.length,
    }

    dispatch({ type: "ADD_CATEGORY", payload: newCategory })
    
    // Limpiar formulario y cerrar
    setCategoryName("")
    setCategoryDescription("")
    setShowCategoryForm(false)
    
    // Auto-seleccionar la nueva categoría
    setSelectedCategoryId(newCategory.id)

    toast({
      title: "Éxito",
      description: "Categoría creada correctamente",
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: categoryId })
    toast({
      title: "Categoría eliminada",
      description: "La categoría y sus productos han sido eliminados",
    })
  }

  const selectedCategory = selectedCategoryId ? safeCategories.find(cat => cat.id === selectedCategoryId) : null
  const selectedCategoryProducts = selectedCategoryId ? getCategoryProducts(selectedCategoryId) : []
  
  // Paginación
  const totalPages = Math.ceil(selectedCategoryProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const paginatedProducts = selectedCategoryProducts.slice(startIndex, endIndex)

  // Reset página cuando cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
  }

  const goToAddProducts = () => {
    if (selectedCategoryId) {
      router.push(`/agregar-producto?category=${selectedCategoryId}`)
    }
  }

  const goToEditProduct = (product: Product) => {
    router.push(`/agregar-producto?category=${product.categoryId}&edit=${product.id}`)
  }

  // Si no hay productos, mostrar gestión de categorías
  if (safeProducts.length === 0) {
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
                <li>Haz clic en "Agregar Productos" para cada categoría</li>
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
        {safeCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Categorías del Menú
                <Badge variant="secondary">{safeCategories.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {safeCategories.map((category) => {
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
        {safeCategories.length === 0 && (
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
            isOpen={showBulkImport}
            onClose={() => setShowBulkImport(false)}
          />
        )}
      </div>
    )
  }

  // Si hay productos, mostrar vista del menú
  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold font-montserrat">Vista Menú</h2>
        </div>
        <p className="text-muted-foreground font-open-sans">Gestiona las categorías y productos de tu menú</p>
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
        {/* Sidebar Controls - 1/4 width */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                Gestión
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Herramientas para gestionar categorías y productos</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Management Actions */}
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkImport(true)}
                      className="w-full flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Upload className="w-4 h-4" />
                      Importación Masiva
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Importa múltiples productos desde un archivo CSV o JSON</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowCategoryForm(!showCategoryForm)}
                      size="sm"
                      variant={showCategoryForm ? "default" : "outline"}
                      className={`w-full flex items-center gap-2 ${
                        showCategoryForm 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {showCategoryForm ? "Cancelar" : "Nueva Categoría"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showCategoryForm ? "Cancelar creación de categoría" : "Crear una nueva categoría para organizar tus productos"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Category Form */}
              {showCategoryForm && (
                <div className="border-t border-red-100 pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-700 text-sm">Crear Categoría</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Las categorías ayudan a organizar tu menú (Ej: Bebidas, Platos Principales, Postres)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="sidebar-category-name" className="text-xs">Nombre *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Nombre visible de la categoría en tu menú</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="sidebar-category-name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Ej: Bebidas, Comidas"
                        className="border-red-200 focus:border-red-400 focus:ring-red-200 text-sm h-8"
                        size="sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="sidebar-category-description" className="text-xs">Descripción</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Descripción opcional que aparecerá debajo del nombre de la categoría</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="sidebar-category-description"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="Descripción breve"
                        className="border-red-200 focus:border-red-400 focus:ring-red-200 text-sm h-8"
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateCategory} 
                        size="sm"
                        className="flex-1 bg-red-500 hover:bg-red-600 text-xs h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Crear
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowCategoryForm(false)
                          setCategoryName("")
                          setCategoryDescription("")
                        }}
                        className="text-xs h-8"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Selector */}
              {safeCategories.length > 0 && (
                <div className="space-y-3">
                  <div className="border-t border-red-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-gray-700 text-sm">Categorías</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Selecciona una categoría para ver y gestionar sus productos</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      {safeCategories.map((category: Category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategoryId === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryChange(category.id)}
                          className={`w-full justify-between ${
                            selectedCategoryId === category.id 
                              ? "bg-red-500 hover:bg-red-600 text-white" 
                              : "border-red-200 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <span className="truncate">{category.name}</span>
                          {getCategoryProducts(category.id).length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryProducts(category.id).length}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button for Selected Category */}
                  {selectedCategory && (
                    <div className="border-t border-red-100 pt-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={goToAddProducts}
                            className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                            size="sm"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar Productos
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ir al formulario para agregar productos a "{selectedCategory.name}"</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Bulk Import Modal */}
          {showBulkImport && (
            <div>
              <BulkImport onClose={() => setShowBulkImport(false)} />
            </div>
          )}

          {/* Selected Category Menu */}
          {selectedCategory && (
            <Card className="shadow-lg border-2 border-red-100">
              <CardHeader className="border-b">
                <div className="text-center space-y-2">
                  <CardTitle className="text-3xl font-black font-montserrat text-red-600">
                    {selectedCategory.name}
                  </CardTitle>
                  {selectedCategory.description && (
                    <p className="text-red-500 font-open-sans italic">{selectedCategory.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedCategoryProducts.length} producto{selectedCategoryProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {selectedCategoryProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="flex justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-muted-foreground">
                        No hay productos en "{selectedCategory.name}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Agrega algunos productos para que aparezcan aquí
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={goToAddProducts}
                          className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Primer Producto
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Comenzar agregando el primer producto a esta categoría</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Products List - Figma Style */}
                    <div className="space-y-2">
                      {paginatedProducts.map((product: Product) => (
                        <Card key={product.id} className="hover:shadow-sm transition-shadow border border-gray-200 rounded-xl">
                          <CardContent className="p-4">
                            <div className="flex gap-4 items-center">
                              {/* Product Image - Square format like Figma */}
                              {product.image ? (
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <ChefHat className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-base leading-tight truncate">{product.name}</h4>
                                    {product.description && (
                                      <p className="text-gray-600 text-sm mt-1 line-clamp-1">{product.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-start gap-2 flex-shrink-0 ml-4">
                                    <div className="text-right">
                                      <span className="font-bold text-gray-900 text-base">
                                        L {product.price.toFixed(2)}
                                      </span>
                                      {product.isv && product.isv > 0 && (
                                        <p className="text-xs text-gray-500">
                                          + ISV L {product.isv.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => goToEditProduct(product)}
                                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Editar "{product.name}"</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>

                                {/* Modifiers - Minimal like Figma */}
                                {product.modifiers && product.modifiers.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {product.modifiers.slice(0, 2).map((modifier, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                                          {modifier.name}
                                        </Badge>
                                      ))}
                                      {product.modifiers.length > 2 && (
                                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                                          +{product.modifiers.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4 border-t border-red-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Anterior
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ir a la página anterior</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Tooltip key={page}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`w-8 h-8 p-0 ${
                                    currentPage === page 
                                      ? "bg-red-500 hover:bg-red-600 text-white" 
                                      : "border-red-200 text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  {page}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ir a la página {page}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1"
                            >
                              Siguiente
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ir a la página siguiente</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {/* Products Info */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center text-sm text-muted-foreground cursor-help">
                          Mostrando {startIndex + 1}-{Math.min(endIndex, selectedCategoryProducts.length)} de {selectedCategoryProducts.length} productos
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Se muestran 5 productos por página para mejor navegación</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>



      {/*  */}
      </div>
    </TooltipProvider>
  )
}
