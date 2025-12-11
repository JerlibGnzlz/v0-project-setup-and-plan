'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { TipoPastor } from '@/lib/validations/pastor'
import { tipoPastorLabels } from '@/lib/validations/pastor'

interface PastoresFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  tipoFilter: TipoPastor | 'todos'
  onTipoFilterChange: (value: TipoPastor | 'todos') => void
  statusFilter: 'todos' | 'activos' | 'inactivos'
  onStatusFilterChange: (value: 'todos' | 'activos' | 'inactivos') => void
  counts: {
    todos: number
    activos: number
    inactivos: number
  }
}

export function PastoresFilters({
  searchTerm,
  onSearchChange,
  tipoFilter,
  onTipoFilterChange,
  statusFilter,
  onStatusFilterChange,
  counts,
}: PastoresFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, sede..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro por tipo */}
        <Select value={tipoFilter} onValueChange={onTipoFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {(Object.keys(tipoPastorLabels) as TipoPastor[])
              .filter(tipo => tipo !== 'PASTOR')
              .map(tipo => (
                <SelectItem key={tipo} value={tipo}>
                  {tipoPastorLabels[tipo]}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {/* Filtro por estado */}
        <Button
          variant={statusFilter === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusFilterChange('todos')}
        >
          Todos <Badge variant="secondary" className="ml-1">{counts.todos}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'activos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusFilterChange('activos')}
        >
          Activos <Badge variant="secondary" className="ml-1">{counts.activos}</Badge>
        </Button>
        <Button
          variant={statusFilter === 'inactivos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusFilterChange('inactivos')}
        >
          Inactivos <Badge variant="secondary" className="ml-1">{counts.inactivos}</Badge>
        </Button>
      </div>
    </div>
  )
}





