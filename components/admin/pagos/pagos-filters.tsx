'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Globe, Smartphone, User } from 'lucide-react'

interface PagosFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  estadoFilter: string
  onEstadoFilterChange: (value: string) => void
  metodoPagoFilter: string
  onMetodoPagoFilterChange: (value: string) => void
  origenFilter: string
  onOrigenFilterChange: (value: string) => void
  onExport: () => void
}

export function PagosFilters({
  searchTerm,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  metodoPagoFilter,
  onMetodoPagoFilterChange,
  origenFilter,
  onOrigenFilterChange,
  onExport,
}: PagosFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, código de referencia o referencia..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={estadoFilter} onValueChange={onEstadoFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="COMPLETADO">Completado</SelectItem>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
          <SelectItem value="CANCELADO">Cancelado</SelectItem>
          <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={metodoPagoFilter} onValueChange={onMetodoPagoFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Método de pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los métodos</SelectItem>
          <SelectItem value="transferencia">Transferencia</SelectItem>
          <SelectItem value="mercadopago">MercadoPago</SelectItem>
          <SelectItem value="efectivo">Efectivo</SelectItem>
          <SelectItem value="otro">Otro</SelectItem>
        </SelectContent>
      </Select>

      <Select value={origenFilter} onValueChange={onOrigenFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Origen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los orígenes</SelectItem>
          <SelectItem value="web">
            <div className="flex items-center gap-2">
              <Globe className="size-3 text-blue-500" />
              Web
            </div>
          </SelectItem>
          <SelectItem value="mobile">
            <div className="flex items-center gap-2">
              <Smartphone className="size-3 text-purple-500" />
              App Móvil
            </div>
          </SelectItem>
          <SelectItem value="dashboard">
            <div className="flex items-center gap-2">
              <User className="size-3 text-amber-500" />
              Dashboard
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onExport}
        className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
      >
        <Download className="size-4 mr-2" />
        Exportar CSV
      </Button>
    </div>
  )
}





























