'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
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
  // El estado vacío se maneja en la página principal
  if (credenciales.length === 0) {
    return null
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left text-sm font-medium">Número</th>
            <th className="p-3 text-left text-sm font-medium">Pastor</th>
            <th className="p-3 text-left text-sm font-medium">Emisión</th>
            <th className="p-3 text-left text-sm font-medium">Vencimiento</th>
            <th className="p-3 text-left text-sm font-medium">Estado</th>
            <th className="p-3 text-left text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {credenciales.map((credencial) => {
            const fechaVencimiento = new Date(credencial.fechaVencimiento)
            const hoy = new Date()
            const diasRestantes = Math.ceil(
              (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <tr key={credencial.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{credencial.numeroCredencial}</span>
                  </div>
                </td>
                <td className="p-3">
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
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(credencial.fechaEmision), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                </td>
                <td className="p-3">
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
                </td>
                <td className="p-3">
                  <Badge
                    variant="outline"
                    className={ESTADO_COLORS[credencial.estado]}
                  >
                    {ESTADO_LABELS[credencial.estado]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(credencial)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

