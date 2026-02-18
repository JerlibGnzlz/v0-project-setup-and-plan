'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const GRADIENT_CLASS =
  'bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent'

export interface SectionFormatBarProps {
  /** Icono del badge (Lucide) */
  badgeIcon: LucideIcon
  /** Texto del badge (ej. "Nuestra Identidad", "Presencia Global") */
  badgeLabel: string
  /** Título: puede ser string o ReactNode con partes en gradiente */
  title: ReactNode
  /** Subtítulo debajo del título */
  subtitle: string
  /** Clases adicionales para el contenedor del header */
  className?: string
  /** Clases adicionales para el párrafo del subtítulo */
  subtitleClassName?: string
  /** Margen inferior del header (ej. "mb-16" o "mb-12") */
  bottomMargin?: 'default' | 'compact'
}

/**
 * Barra de formato reutilizable para encabezados de secciones en la landing.
 * Incluye badge con icono, título (con soporte para texto con gradiente) y subtítulo.
 */
export function SectionFormatBar({
  badgeIcon: Icon,
  badgeLabel,
  title,
  subtitle,
  className,
  subtitleClassName,
  bottomMargin = 'default',
}: SectionFormatBarProps) {
  return (
    <div
      className={cn(
        'text-center',
        bottomMargin === 'default' ? 'mb-16' : 'mb-12',
        className
      )}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
        <Icon className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
        <span className="text-sm text-white/80 font-medium">{badgeLabel}</span>
      </div>
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
        {title}
      </h2>
      <p
        className={cn(
          'text-lg text-white/60 max-w-3xl mx-auto',
          subtitleClassName
        )}
      >
        {subtitle}
      </p>
    </div>
  )
}

/** Clase para aplicar el gradiente al texto del título dentro de SectionFormatBar */
export const sectionTitleGradientClass = GRADIENT_CLASS
