"use client"

import { useCallback } from "react"

interface MenuBuilderDB {
  categories: unknown[]
  products: unknown[]
  activeCategory: number | null
  editingProduct: number | null
}

const DB_NAME = "MenuBuilderDB"
const DB_VERSION = 1
const STORE_NAME = "menuData"

export function useIndexedDB() {
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
          store.createIndex("type", "type", { unique: false })
        }
      }
    })
  }, [])

  const saveData = useCallback(async (data: MenuBuilderDB) => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      
      await store.put({ id: "menuData", ...data })
      
      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.error("Error saving to IndexedDB:", error)
      throw error
    }
  }, [openDB])

  const loadData = useCallback(async (): Promise<MenuBuilderDB | null> => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.get("menuData")
        
        request.onsuccess = () => {
          const result = request.result
          if (result) {
            const { id, ...data } = result
            resolve(data as MenuBuilderDB)
          } else {
            resolve(null)
          }
        }
        
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error("Error loading from IndexedDB:", error)
      return null
    }
  }, [openDB])

  const clearData = useCallback(async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      
      await store.delete("menuData")
      
      return new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.error("Error clearing IndexedDB:", error)
      throw error
    }
  }, [openDB])

  const migrateFromLocalStorage = useCallback(async () => {
    try {
      const localStorageData = localStorage.getItem("menu-builder-state")
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData)
        await saveData(parsedData)
        localStorage.removeItem("menu-builder-state")
        console.log("Data migrated from localStorage to IndexedDB")
        return parsedData
      }
      return null
    } catch (error) {
      console.error("Error migrating from localStorage:", error)
      return null
    }
  }, [saveData])

  return {
    saveData,
    loadData,
    clearData,
    migrateFromLocalStorage
  }
}