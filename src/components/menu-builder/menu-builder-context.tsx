"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { useToast } from "../../hooks/use-toast"

export interface Category {
  id: string
  name: string
  description?: string
  order: number
}

export interface Modifier {
  id: string
  name: string
  type: "single" | "multiple"
  required: boolean
  min: number
  max: number
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  name: string
  price: number
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image?: string
  modifiers: Modifier[]
  order: number
}

interface MenuBuilderState {
  categories: Category[]
  products: Product[]
  activeCategory: string | null
  editingProduct: string | null
}

type MenuBuilderAction =
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "REORDER_CATEGORIES"; payload: Category[] }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "REORDER_PRODUCTS"; payload: Product[] }
  | { type: "SET_ACTIVE_CATEGORY"; payload: string | null }
  | { type: "SET_EDITING_PRODUCT"; payload: string | null }
  | { type: "LOAD_DATA"; payload: MenuBuilderState }
  | { type: "CLEAR_DATA" }

const initialState: MenuBuilderState = {
  categories: [],
  products: [],
  activeCategory: null,
  editingProduct: null,
}

function menuBuilderReducer(state: MenuBuilderState, action: MenuBuilderAction): MenuBuilderState {
  switch (action.type) {
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) => (cat.id === action.payload.id ? action.payload : cat)),
      }
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
        products: state.products.filter((product) => product.categoryId !== action.payload),
        activeCategory: state.activeCategory === action.payload ? null : state.activeCategory,
      }
    case "REORDER_CATEGORIES":
      return {
        ...state,
        categories: action.payload,
      }
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      }
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) => (product.id === action.payload.id ? action.payload : product)),
      }
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
      }
    case "REORDER_PRODUCTS":
      return {
        ...state,
        products: action.payload,
      }
    case "SET_ACTIVE_CATEGORY":
      return {
        ...state,
        activeCategory: action.payload,
      }
    case "SET_EDITING_PRODUCT":
      return {
        ...state,
        editingProduct: action.payload,
      }
    case "LOAD_DATA":
      return action.payload
    case "CLEAR_DATA":
      return initialState
    default:
      return state
  }
}

interface MenuBuilderContextType {
  state: MenuBuilderState
  dispatch: React.Dispatch<MenuBuilderAction>
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  exportToJSON: () => string
  importFromJSON: (jsonString: string) => void
}

const MenuBuilderContext = createContext<MenuBuilderContextType | undefined>(undefined)

export function MenuBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(menuBuilderReducer, initialState)
  const { toast } = useToast()

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem("menuBuilderData", JSON.stringify(state))
    } catch {
      toast({
        title: "Error",
        description: "Failed to save data to local storage",
        variant: "destructive",
      })
    }
  }, [state, toast])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem("menuBuilderData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: parsedData })
        toast({
          title: "Success",
          description: "Data loaded successfully",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load data from local storage",
        variant: "destructive",
      })
    }
  }, [dispatch, toast])

  const exportToJSON = () => {
    const menu = state.categories.map((category) => ({
      category: category.name,
      description: category.description,
      products: state.products
        .filter((product) => product.categoryId === category.id)
        .sort((a, b) => a.order - b.order)
        .map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          modifiers: product.modifiers,
        })),
    }))

    return JSON.stringify({ menu }, null, 2)
  }

  const importFromJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString)
      if (!data.menu || !Array.isArray(data.menu)) {
        throw new Error("Invalid JSON format")
      }

      const categories: Category[] = []
      const products: Product[] = []

      data.menu.forEach((categoryData: { category: string; description?: string; products?: unknown[] }, categoryIndex: number) => {
        const categoryId = `category-${Date.now()}-${categoryIndex}`
        const category: Category = {
          id: categoryId,
          name: categoryData.category,
          description: categoryData.description,
          order: categoryIndex,
        }
        categories.push(category)

        if (categoryData.products && Array.isArray(categoryData.products)) {
          categoryData.products.forEach((productData: unknown, productIndex: number) => {
            const data = productData as { name: string; description?: string; price: number; image?: string; modifiers?: Modifier[] }
            const product: Product = {
              id: `product-${Date.now()}-${categoryIndex}-${productIndex}`,
              categoryId,
              name: data.name,
              description: data.description || "",
              price: data.price,
              image: data.image,
              modifiers: data.modifiers || [],
              order: productIndex,
            }
            products.push(product)
          })
        }
      })

      dispatch({
        type: "LOAD_DATA",
        payload: {
          categories,
          products,
          activeCategory: null,
          editingProduct: null,
        },
      })

      toast({
        title: "Success",
        description: "Menu imported successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive",
      })
    }
  }

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (state.categories.length > 0 || state.products.length > 0) {
      saveToLocalStorage()
    }
  }, [state, saveToLocalStorage])

  // Load data on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  return (
    <MenuBuilderContext.Provider
      value={{
        state,
        dispatch,
        saveToLocalStorage,
        loadFromLocalStorage,
        exportToJSON,
        importFromJSON,
      }}
    >
      {children}
    </MenuBuilderContext.Provider>
  )
}

export function useMenuBuilder() {
  const context = useContext(MenuBuilderContext)
  if (context === undefined) {
    throw new Error("useMenuBuilder must be used within a MenuBuilderProvider")
  }
  return context
}
