'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface InscripcionesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  estadoFilter: string
  onEstadoFilterChange: (value: string) => void
  convencionFilter: string
  onConvencionFilterChange: (value: string) => void
  pagoCompletoFilter: string
  onPagoCompletoFilterChange: (value: string) => void
  convencionesUnicas: string[]
}

export function InscripcionesFilters({
  searchTerm,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  convencionFilter,
  onConvencionFilterChange,
  pagoCompletoFilter,
  onPagoCompletoFilterChange,
  convencionesUnicas,
}: InscripcionesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Buscar por nombre, email, código de referencia o teléfono..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={estadoFilter} onValueChange={onEstadoFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="confirmado">Confirmado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
      {convencionesUnicas.length > 0 && (
        <Select value={convencionFilter} onValueChange={onConvencionFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Convención" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las convenciones</SelectItem>
            {convencionesUnicas.map((titulo: string) => (
              <SelectItem key={titulo} value={titulo}>
                {titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={pagoCompletoFilter} onValueChange={onPagoCompletoFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Estado de Pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los pagos</SelectItem>
          <SelectItem value="completo">Pago Completo (3/3)</SelectItem>
          <SelectItem value="pendiente">Pago Pendiente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
















