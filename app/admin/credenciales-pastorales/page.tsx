'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCredencialesPastorales,
  useCredencialPorVencer,
  useCredencialesVencidas,
  useActualizarEstadosCredenciales,
} from '@/lib/hooks/use-credenciales-pastorales'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Filter,
} from 'lucide-react'
import { CredencialPastoralDialog } from '@/components/admin/credenciales-pastorales/credencial-pastoral-dialog'
import { CredencialPastoralTable } from '@/components/admin/credenciales-pastorales/credencial-pastoral-table'
import { toast } from 'sonner'

const ESTADO_COLORS = {
  VIGENTE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  POR_VENCER: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  VENCIDA: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  SIN_CREDENCIAL: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
}

const ESTADO_LABELS = {
  VIGENTE: 'Vigente',
  POR_VENCER: 'Por Vencer',
  VENCIDA: 'Vencida',
  SIN_CREDENCIAL: 'Sin Credencial',
}

export default function CredencialesPastoralesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [estadoFilter, setEstadoFilter] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCredencial, setSelectedCredencial] = useState<CredencialPastoral | null>(null)

  const filters = {
    estado: estadoFilter !== 'todos' ? (estadoFilter as any) : undefined,
    numeroCredencial: searchTerm || undefined,
  }

  const { data, isLoading, error } = useCredencialesPastorales(page, limit, filters)
  const { data: porVencer } = useCredencialPorVencer()
  const { data: vencidas } = useCredencialesVencidas()
  const actualizarEstadosMutation = useActualizarEstadosCredenciales()

  const handleCreate = () => {
    setSelectedCredencial(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (credencial: CredencialPastoral) => {
    setSelectedCredencial(credencial)
    setIsDialogOpen(true)
  }

  const handleActualizarEstados = async () => {
    try {
      await actualizarEstadosMutation.mutateAsync()
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const credenciales = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credenciales Pastorales</h1>
          <p className="text-muted-foreground">
            Gestiona las credenciales ministeriales de los pastores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleActualizarEstados}
            disabled={actualizarEstadosMutation.isPending}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${actualizarEstadosMutation.isPending ? 'animate-spin' : ''}`}
            />
            Actualizar Estados
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Credencial
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credenciales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Credenciales activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {credenciales.filter((c) => c.estado === 'VIGENTE').length}
            </div>
            <p className="text-xs text-muted-foreground">En buen estado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {porVencer?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{vencidas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Requieren renovación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra las credenciales por estado o número</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por número de credencial..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="VIGENTE">Vigente</SelectItem>
                <SelectItem value="POR_VENCER">Por Vencer</SelectItem>
                <SelectItem value="VENCIDA">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">Error al cargar credenciales</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <CredencialPastoralTable
            credenciales={credenciales}
            onEdit={handleEdit}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog */}
      <CredencialPastoralDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        credencial={selectedCredencial}
      />
    </div>
  )
}

