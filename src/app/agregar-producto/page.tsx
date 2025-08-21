"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { ProductForm } from "../../components/menu-builder/product-form"
import { useMenuBuilder } from "../../components/menu-builder/menu-builder-context"
import type { Product } from "../../components/menu-builder/menu-builder-context"

export default function AgregarProductoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, dispatch } = useMenuBuilder()

  const productIdParam = searchParams.get("id") || searchParams.get("edit")
  const categoryIdParam = searchParams.get("category")
  const productId = productIdParam ? parseInt(productIdParam) : null
  const categoryId = categoryIdParam ? parseInt(categoryIdParam) : null
  const isEditing = !!productId

  const [product, setProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 5

  useEffect(() => {
    if (isEditing && productId) {
      const existingProduct = state.products.find((p) => p.id === productId)
      if (existingProduct) {
        setProduct(existingProduct)
      }
    }
  }, [isEditing, productId, state.products])

  const handleSave = (productData: Omit<Product, 'id' | 'order'>) => {
    if (isEditing && productId) {
      const updatedProduct = { 
        ...productData, 
        id: productId, 
        order: product?.order || 0 
      }
      dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct })
      setProduct(null) // Clear editing state
      
      // Clear query parameters to exit edit mode
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("edit")
      newUrl.searchParams.delete("id")
      router.replace(newUrl.pathname + newUrl.search)
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
        order: state.products.length,
      }
      dispatch({ type: "ADD_PRODUCT", payload: newProduct })
      // Reset to page 1 to show the new product
      setCurrentPage(1)
    }
    // Don't redirect, stay on page
  }

  const handleEdit = (productToEdit: Product) => {
    setProduct(productToEdit)
  }

  const handleDelete = (productId: number) => {
    dispatch({ type: "DELETE_PRODUCT", payload: productId })
    if (product?.id === productId) {
      setProduct(null)
    }
  }

  const getFilteredProducts = () => {
    if (!categoryId) return state.products
    return state.products.filter(p => p.categoryId === categoryId)
  }

  // Paginación
  const filteredProducts = getFilteredProducts()
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const getCategoryName = (catId: number) => {
    const category = state.categories.find(c => c.id === catId)
    return category?.name || 'Sin categoría'
  }

  const handleCancel = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Menú
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product ? "Editar Producto" : "Agregar Productos"}
                {categoryId && (
                  <span className="text-red-500 ml-2">
                    - {getCategoryName(categoryId)}
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                {product ? "Modifica los detalles del producto" : 
                 categoryId ? `Agrega productos a la categoría "${getCategoryName(categoryId)}"` :
                 "Agrega múltiples productos a tu menú"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg mb-8">
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {product ? "Editar Producto" : "Nuevo Producto"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ProductForm
              categories={state.categories}
              onSave={handleSave}
              onCancel={() => {
                setProduct(null)
                // Clear query parameters when canceling edit
                if (isEditing) {
                  const newUrl = new URL(window.location.href)
                  newUrl.searchParams.delete("edit")
                  newUrl.searchParams.delete("id")
                  router.replace(newUrl.pathname + newUrl.search)
                }
              }}
              initialProduct={product || undefined}
              defaultCategoryId={categoryId?.toString() || undefined}
              showButtons={true}
            />
          </CardContent>
        </Card>

        {/* Products Table */}
        {filteredProducts.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Productos {categoryId ? `de ${getCategoryName(categoryId)}` : 'Creados'}
                <Badge variant="secondary">{filteredProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>ISV</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Modificadores</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell>
                        {prod.image ? (
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            Sin imagen
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prod.name}</div>
                          <div className="text-sm text-gray-500">{prod.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(prod.categoryId)}</TableCell>
                      <TableCell>L. {prod.price.toFixed(2)}</TableCell>
                      <TableCell>{prod.isv}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        L. {(prod.price * (1 + prod.isv / 100)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {prod.modifiers?.length || 0} modificadores
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prod)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(prod.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t">
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
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
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
                    ))}
                  </div>

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
                </div>
              )}

              {/* Products Info */}
              <div className="text-center text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
