'use client'

import { useEffect, useRef, ReactNode, useState } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Verificar si el elemento ya está visible al cargar (para cuando se restaura scroll)
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isInViewport) {
        // Si ya está visible, mostrarlo inmediatamente
        setTimeout(() => {
          setIsVisible(true)
        }, delay)
        return true
      }
      return false
    }

    // Verificar visibilidad inicial después de un pequeño delay
    const initialCheck = setTimeout(() => {
      if (checkInitialVisibility()) {
        return // Ya está visible, no necesitamos el observer
      }
    }, 100)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    // Si no está visible inicialmente, usar el observer
    if (!checkInitialVisibility()) {
      observer.observe(element)
    }

    return () => {
      clearTimeout(initialCheck)
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ animationDuration: '700ms', animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  )
}
