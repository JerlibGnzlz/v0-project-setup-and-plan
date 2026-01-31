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
}

/**
 * Elemento flotante que sigue al mouse (badge/tooltip/custom cursor).
 * Implementado para NO provocar scroll horizontal:
 * - position: fixed (no afecta el layout del documento)
 * - Coordenadas clampadas al viewport según tamaño del elemento
 * - pointer-events: none (no interfiere con clics)
 * - Contenedor de la landing debe tener overflow-x: hidden por seguridad
 *
 * Ubicación recomendada: en app/page.tsx, dentro del mismo div que ScrollProgress
 * y FloatingCTA (hermano de ellos), para que solo aparezca en la landing.
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
}: MouseFollowerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [pastScrollThreshold, setPastScrollThreshold] = useState(
    showOnlyAfterScrollY == null
  )
  const rafId = useRef<number | null>(null)
  const ticking = useRef(false)

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
    if (!enabled || !pastScrollThreshold) return

    const handleMouseMove = (e: MouseEvent) => {
      if (ticking.current) return
      ticking.current = true

      rafId.current = window.requestAnimationFrame(() => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        // Clamp: el elemento no debe salir del viewport (evita scroll horizontal/vertical)
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
  }, [enabled, pastScrollThreshold, offsetX, offsetY, width, height])

  if (!enabled || !pastScrollThreshold) return null

  return (
    <div
      aria-hidden
      className={`fixed z-[60] pointer-events-none transition-opacity duration-150 ${className}`}
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
        // Asegurar que no desborde (por si el contenido es más grande que width/height)
        maxWidth: `min(100vw - ${position.x}px, ${width}px)`,
      }}
    >
      {children}
    </div>
  )
}
