'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import type { CategoriaNoticia } from '@/lib/api/noticias'
import { categoriaLabels } from '@/lib/api/noticias'

interface NoticiasFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterCategoria: CategoriaNoticia | 'TODAS'
  onCategoriaChange: (value: CategoriaNoticia | 'TODAS') => void
  filterPublicado: 'TODOS' | 'PUBLICADOS' | 'BORRADORES'
  onPublicadoChange: (value: 'TODOS' | 'PUBLICADOS' | 'BORRADORES') => void
  categorias: CategoriaNoticia[]
}

export function NoticiasFilters({
  searchQuery,
  onSearchChange,
  filterCategoria,
  onCategoriaChange,
  filterPublicado,
  onPublicadoChange,
  categorias,
}: NoticiasFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar noticias..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filterCategoria} onValueChange={onCategoriaChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODAS">Todas las categorías</SelectItem>
          {categorias.map(cat => (
            <SelectItem key={cat} value={cat}>
              {categoriaLabels[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterPublicado} onValueChange={onPublicadoChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos</SelectItem>
          <SelectItem value="PUBLICADOS">Publicados</SelectItem>
          <SelectItem value="BORRADORES">Borradores</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}






















