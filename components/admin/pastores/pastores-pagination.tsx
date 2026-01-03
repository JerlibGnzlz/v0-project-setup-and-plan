'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationMeta {
  total: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PastoresPaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  paginationMeta: PaginationMeta | null
  pageSize: number
  isLoading: boolean
}

export function PastoresPagination({
  currentPage,
  onPageChange,
  paginationMeta,
  pageSize,
  isLoading,
}: PastoresPaginationProps) {
  if (!paginationMeta || paginationMeta.totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
        {Math.min(currentPage * pageSize, paginationMeta.total)} de {paginationMeta.total} pastores
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!paginationMeta.hasPreviousPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {paginationMeta.totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!paginationMeta.hasNextPage || isLoading}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}































