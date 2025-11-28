"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

// Canal de broadcast para comunicación entre pestañas (más eficiente que localStorage)
let broadcastChannel: BroadcastChannel | null = null

// Tipos de datos que pueden actualizarse
export type DataType = "convencion" | "galeria" | "pastores" | "pagos" | "all"

interface SyncMessage {
  type: DataType
  timestamp: number
  source: string
}

// Generar un ID único para esta pestaña
const tabId = typeof window !== "undefined" ? `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : ""

/**
 * Hook para sincronización inteligente de datos
 * - Pausa el polling cuando la pestaña no está visible
 * - Usa BroadcastChannel para comunicación instantánea entre pestañas
 * - Refetch automático cuando la pestaña vuelve a estar visible
 */
export function useSmartSync() {
  const queryClient = useQueryClient()
  const [isVisible, setIsVisible] = useState(true)
  const lastRefetchRef = useRef<number>(Date.now())

  // Inicializar BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      broadcastChannel = new BroadcastChannel("amva-sync-channel")
      
      broadcastChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const { type, source } = event.data
        
        // Ignorar mensajes de la misma pestaña
        if (source === tabId) return
        
        console.log(`📡 Recibido cambio de otra pestaña: ${type}`)
        
        // Invalidar y refetch las queries correspondientes
        invalidateByType(type)
      }
    } catch (error) {
      // BroadcastChannel no está soportado, usar fallback con localStorage
      console.log("BroadcastChannel no soportado, usando localStorage")
    }

    return () => {
      broadcastChannel?.close()
    }
  }, [])

  // Manejar visibilidad de la pestaña
  useEffect(() => {
    if (typeof document === "undefined") return

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible"
      setIsVisible(visible)
      
      if (visible) {
        // Si han pasado más de 30 segundos desde el último refetch, actualizar datos
        const timeSinceLastRefetch = Date.now() - lastRefetchRef.current
        if (timeSinceLastRefetch > 30000) {
          console.log("🔄 Pestaña visible después de tiempo inactivo, actualizando datos...")
          invalidateByType("all")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Escuchar cambios en localStorage (fallback para navegadores sin BroadcastChannel)
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("amva-update-")) {
        const type = e.key.replace("amva-update-", "") as DataType
        console.log(`📦 Cambio detectado via localStorage: ${type}`)
        invalidateByType(type)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Función para invalidar queries según el tipo
  const invalidateByType = useCallback((type: DataType) => {
    lastRefetchRef.current = Date.now()
    
    switch (type) {
      case "convencion":
        queryClient.invalidateQueries({ queryKey: ["convencion"] })
        queryClient.invalidateQueries({ queryKey: ["convenciones"] })
        break
      case "galeria":
        queryClient.invalidateQueries({ queryKey: ["galeria"] })
        break
      case "pastores":
        queryClient.invalidateQueries({ queryKey: ["pastores"] })
        break
      case "pagos":
        queryClient.invalidateQueries({ queryKey: ["pagos"] })
        break
      case "all":
        queryClient.invalidateQueries()
        break
    }
  }, [queryClient])

  // Función para notificar cambios a otras pestañas
  const notifyChange = useCallback((type: DataType) => {
    const message: SyncMessage = {
      type,
      timestamp: Date.now(),
      source: tabId,
    }

    // Enviar via BroadcastChannel
    try {
      broadcastChannel?.postMessage(message)
    } catch (error) {
      // Fallback a localStorage
    }

    // También usar localStorage como fallback
    localStorage.setItem(`amva-update-${type}`, Date.now().toString())
  }, [])

  return {
    isVisible,
    notifyChange,
    invalidateByType,
  }
}

/**
 * Hook para polling inteligente que se pausa cuando la pestaña no está visible
 */
export function useSmartPolling(
  queryKey: string[],
  intervalMs: number = 30000
) {
  const [shouldPoll, setShouldPoll] = useState(true)

  useEffect(() => {
    if (typeof document === "undefined") return

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible"
      setShouldPoll(visible)
      
      if (visible) {
        console.log(`👁️ Polling reactivado para: ${queryKey.join("/")}`)
      } else {
        console.log(`💤 Polling pausado para: ${queryKey.join("/")}`)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [queryKey])

  return shouldPoll ? intervalMs : false
}
