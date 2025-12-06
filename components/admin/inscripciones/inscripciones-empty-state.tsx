'use client'

interface InscripcionesEmptyStateProps {
  hasInscripciones: boolean
}

export function InscripcionesEmptyState({ hasInscripciones }: InscripcionesEmptyStateProps) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      {hasInscripciones
        ? 'No se encontraron inscripciones con los filtros aplicados'
        : 'No hay inscripciones registradas'}
    </div>
  )
}

