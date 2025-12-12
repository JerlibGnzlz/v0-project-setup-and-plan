'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Calendar, CreditCard, User } from 'lucide-react'

interface CredencialPastoralTableProps {
  credenciales: CredencialPastoral[]
  onEdit: (credencial: CredencialPastoral) => void
}

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

export function CredencialPastoralTable({
  credenciales,
  onEdit,
}: CredencialPastoralTableProps) {
  if (credenciales.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold">No hay credenciales</p>
        <p className="text-sm text-muted-foreground">
          Crea una nueva credencial para comenzar
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Pastor</TableHead>
            <TableHead>Emisión</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credenciales.map((credencial) => {
            const fechaVencimiento = new Date(credencial.fechaVencimiento)
            const hoy = new Date()
            const diasRestantes = Math.ceil(
              (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <TableRow key={credencial.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{credencial.numeroCredencial}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {credencial.pastor.nombre} {credencial.pastor.apellido}
                      </p>
                      {credencial.pastor.email && (
                        <p className="text-xs text-muted-foreground">{credencial.pastor.email}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(credencial.fechaEmision), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm">
                        {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                      </span>
                      {diasRestantes > 0 && diasRestantes <= 30 && (
                        <p className="text-xs text-amber-600">
                          {diasRestantes} días restantes
                        </p>
                      )}
                      {diasRestantes < 0 && (
                        <p className="text-xs text-red-600">
                          Vencida hace {Math.abs(diasRestantes)} días
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={ESTADO_COLORS[credencial.estado]}
                  >
                    {ESTADO_LABELS[credencial.estado]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(credencial)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

