'use client'

import { PastoresTableRow } from './pastores-table-row'
import type { Pastor } from '@/lib/api/pastores'
import type { TipoPastor } from '@/lib/validations/pastor'

interface PastoresTableProps {
  pastores: Pastor[]
  onEdit: (pastor: Pastor) => void
  tipoConfig: Record<
    TipoPastor,
    { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
  >
}

export function PastoresTable({ pastores, onEdit, tipoConfig }: PastoresTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left text-sm font-medium">Pastor</th>
            <th className="p-3 text-left text-sm font-medium">Tipo</th>
            <th className="p-3 text-left text-sm font-medium">Cargo</th>
            <th className="p-3 text-left text-sm font-medium">Ubicación</th>
            <th className="p-3 text-left text-sm font-medium">Landing</th>
            <th className="p-3 text-left text-sm font-medium">Estado</th>
            <th className="p-3 text-left text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pastores.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                No se encontraron pastores
              </td>
            </tr>
          ) : (
            pastores.map(pastor => (
              <PastoresTableRow
                key={pastor.id}
                pastor={pastor}
                onEdit={onEdit}
                tipoConfig={tipoConfig}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}











