'use client'

import { useState, useEffect, useRef } from 'react'

interface MouseFollowerProps {
  /** Contenido del badge/tooltip (texto, icono, etc.) */
  children: React.ReactNode
  /** Desplazamiento en px desde el cursor (evita tapar el click) */
  offsetX?: number
  offsetY?: number
  /** Ancho estimado del elemento para clamp (evita salir del viewport) */
  width?: number
  height?: number
  /** Clases adicionales del contenedor */
  className?: string
  /** Si es false, no se renderiza (útil para solo desktop) */
  enabled?: boolean
  /** Mostrar solo después de este scroll Y (ej: 600 = mismo momento que FloatingCTA). Sin definir = siempre visible. */
  showOnlyAfterScrollY?: number
  /** Ocultar cursor nativo cuando el follower está visible (estilo Mercado Libre / tutoriales) */
  hideCursor?: boolean
  /** z-index del elemento (default 999 para estar sobre todo) */
  zIndex?: number
}

/**
 * Elemento flotante que sigue al mouse (tracking visual, tutoriales, micro-interacciones).
 * Patrón tipo Mercado Libre: position: fixed + transform (GPU), pointer-events: none.
 *
 * - position: fixed; top/left pequeños; transform: translate(x,y) para la posición (no mueve el scroll).
 * - Coordenadas clampadas al viewport para no provocar scroll horizontal/vertical.
 * - pointer-events: none para no interferir con clics.
 *
 * Dónde usarlo en la landing:
 * 1. Refuerzo CTA (actual): después del hero (showOnlyAfterScrollY) → "Inscribirse en convención".
 * 2. Solo en Hero: hint sutil "Explorar" o "Ver convenciones" (showOnlyAfterScrollY sin definir, pero solo en sección hero vía lógica).
 * 3. Solo en sección Convenciones: micro-interacción "Inscribirse aquí" cuando el usuario está en #convenciones.
 * 4. Tutorial/onboarding: primera visita, tooltip que sigue al mouse apuntando al CTA.
 */
export function MouseFollower({
  children,
  offsetX = 16,
  offsetY = 16,
  width = 120,
  height = 40,
  className = '',
  enabled = true,
  showOnlyAfterScrollY,
  hideCursor = false,
  zIndex = 999,
}: MouseFollowerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(true)
  const [pastScrollThreshold, setPastScrollThreshold] = useState(
    showOnlyAfterScrollY == null
  )
  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)

  useEffect(() => {
    setIsTouchDevice(
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches)
    )
  }, [])

  const isEnabled = Boolean(enabled && !isTouchDevice)

  useEffect(() => {
    if (showOnlyAfterScrollY == null) {
      setPastScrollThreshold(true)
      return
    }
    const check = () =>
      setPastScrollThreshold(window.scrollY >= showOnlyAfterScrollY)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [showOnlyAfterScrollY])

  useEffect(() => {
    if (!isEnabled || !pastScrollThreshold) return

    const handleMouseMove = (e: MouseEvent) => {
      if (ticking.current) return
      ticking.current = true

      rafId.current = window.requestAnimationFrame(() => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const x = Math.max(0, Math.min(e.clientX + offsetX, vw - width))
        const y = Math.max(0, Math.min(e.clientY + offsetY, vh - height))
        setPosition({ x, y })
        setIsVisible(true)
        ticking.current = false
      })
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [isEnabled, pastScrollThreshold, offsetX, offsetY, width, height])

  useEffect(() => {
    if (!hideCursor || !isEnabled) return
    const style = document.documentElement.style
    if (isVisible && pastScrollThreshold) {
      style.setProperty('cursor', 'none')
    } else {
      style.removeProperty('cursor')
    }
    return () => style.removeProperty('cursor')
  }, [hideCursor, isEnabled, isVisible, pastScrollThreshold])

  // SSR/prerender: no window, avoid any client-only logic
  if (typeof window === 'undefined') return null
  if (!enabled || isTouchDevice || !pastScrollThreshold) return null

  return (
    <div
      aria-hidden
      className={`fixed top-0 left-0 pointer-events-none transition-opacity duration-150 ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        opacity: isVisible ? 1 : 0,
        zIndex,
        maxWidth: `min(100vw - ${position.x}px, ${width}px)`,
      }}
    >
      {children}
    </div>
  )
}
