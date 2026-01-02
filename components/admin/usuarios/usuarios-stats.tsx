import { Card, CardContent } from '@/components/ui/card'
import { Shield, UserCheck, Eye, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UsuariosStatsProps {
  stats: {
    total: number
    admins: number
    editors: number
    viewers: number
  }
  isLoading: boolean
}

export function UsuariosStats({ stats, isLoading }: UsuariosStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-sky-500/10">
              <Users className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Administradores</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Shield className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Editores</p>
              <p className="text-2xl font-bold">{stats.editors}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visualizadores</p>
              <p className="text-2xl font-bold">{stats.viewers}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Eye className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

