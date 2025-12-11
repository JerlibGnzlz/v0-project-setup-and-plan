'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Trash2 } from 'lucide-react'

interface Convencion {
  id: string
  titulo?: string
  fechaInicio?: string | Date
  activa?: boolean
  archivada?: boolean
  fechaArchivado?: string | Date
}

interface DashboardConvencionesListProps {
  convenciones: Convencion[]
  convencionActiva: Convencion | null
  mostrarArchivadas: boolean
  setMostrarArchivadas: (value: boolean) => void
  filtroAno: string
  setFiltroAno: (value: string) => void
  onArchivar: (id: string) => void
  onDesarchivar: (id: string) => void
  onDelete: (id: string, titulo: string) => void
  isArchivarPending: boolean
  isDesarchivarPending: boolean
  isDeletePending: boolean
}

export function DashboardConvencionesList({
  convenciones,
  convencionActiva,
  mostrarArchivadas,
  setMostrarArchivadas,
  filtroAno,
  setFiltroAno,
  onArchivar,
  onDesarchivar,
  onDelete,
  isArchivarPending,
  isDesarchivarPending,
  isDeletePending,
}: DashboardConvencionesListProps) {
  // Obtener años únicos de las convenciones
  const anos = Array.from(
    new Set(
      convenciones
        .map(c => {
          if (!c.fechaInicio) return null
          const fecha = typeof c.fechaInicio === 'string' ? new Date(c.fechaInicio) : c.fechaInicio
          return fecha.getFullYear()
        })
        .filter((ano): ano is number => ano !== null)
    )
  ).sort((a, b) => b - a)

  // Filtrar convenciones
  const convencionesFiltradas = convenciones.filter(c => {
    // Excluir la convención activa
    if (c.id === convencionActiva?.id) return false

    // Filtro de archivadas
    if (!mostrarArchivadas && c.archivada) return false
    if (mostrarArchivadas && !c.archivada) return false

    // Filtro de año
    if (filtroAno !== 'todos') {
      if (!c.fechaInicio) return false
      const fecha = typeof c.fechaInicio === 'string' ? new Date(c.fechaInicio) : c.fechaInicio
      const ano = fecha.getFullYear()
      return ano.toString() === filtroAno
    }

    return true
  })

  return (
    <ScrollReveal delay={250}>
      <Card className="border-2 border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/50 dark:from-background dark:to-sky-950/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Gestión de Convenciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros y lista de convenciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Todas las Convenciones</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarArchivadas(!mostrarArchivadas)}
                className="text-xs"
              >
                {mostrarArchivadas ? 'Ocultar' : 'Mostrar'} Archivadas
              </Button>
            </div>

            {/* Filtro por año */}
            <div className="flex items-center gap-2">
              <Label htmlFor="filtro-ano" className="text-xs text-muted-foreground">
                Filtrar por año:
              </Label>
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {convencionesFiltradas.map(conv => {
                const fechaInicio = conv.fechaInicio
                  ? typeof conv.fechaInicio === 'string'
                    ? new Date(conv.fechaInicio)
                    : conv.fechaInicio
                  : null
                const ano = fechaInicio ? fechaInicio.getFullYear() : null

                return (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{conv.titulo || 'Sin título'}</p>
                        {conv.archivada && (
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Archivada
                          </span>
                        )}
                        {conv.activa && !conv.archivada && (
                          <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30">
                            Activa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fechaInicio
                          ? fechaInicio.toLocaleDateString('es-ES')
                          : 'Sin fecha'}
                        {ano && <span className="ml-2">• {ano}</span>}
                        {conv.fechaArchivado && (
                          <span className="ml-2 text-amber-600 dark:text-amber-400">
                            • Archivada:{' '}
                            {new Date(conv.fechaArchivado).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.archivada ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => onDesarchivar(conv.id)}
                          disabled={isDesarchivarPending}
                        >
                          Desarchivar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Archivar la convención "${conv.titulo || 'Sin título'}"? Se desactivará automáticamente.`
                              )
                            ) {
                              onArchivar(conv.id)
                            }
                          }}
                          disabled={isArchivarPending}
                        >
                          Archivar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(conv.id, conv.titulo || 'Sin título')}
                        disabled={isDeletePending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {convencionesFiltradas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay convenciones {mostrarArchivadas ? 'archivadas' : 'disponibles'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}





