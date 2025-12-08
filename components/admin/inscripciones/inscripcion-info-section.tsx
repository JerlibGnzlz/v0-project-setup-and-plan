'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Smartphone,
  User,
  Star,
  Pencil,
  XCircle,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { type Inscripcion } from '@/lib/api/inscripciones'
import { esNueva, type PagosInfo } from '@/lib/hooks/use-inscripcion-utils'

interface InscripcionInfoSectionProps {
  inscripcion: Inscripcion
  pagosInfo: PagosInfo
  onEditar: (inscripcion: Inscripcion) => void
  onCancelar: (inscripcion: Inscripcion) => void
  onRehabilitar: (inscripcionId: string) => Promise<void>
  isRehabilitando: boolean
}

export function InscripcionInfoSection({
  inscripcion,
  pagosInfo,
  onEditar,
  onCancelar,
  onRehabilitar,
  isRehabilitando,
}: InscripcionInfoSectionProps) {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg">
            {inscripcion.nombre} {inscripcion.apellido}
          </h3>
          {/* Badge de origen de inscripción */}
          {inscripcion.origenRegistro === 'mobile' ? (
            <Badge
              variant="outline"
              className="bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs"
              title="Pastor registrado - Inscrito desde la app móvil (requiere cuenta)"
            >
              <Smartphone className="size-3 mr-1" />
              Pastor App
            </Badge>
          ) : inscripcion.origenRegistro === 'dashboard' ? (
            <Badge
              variant="outline"
              className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs"
              title="Inscrito manualmente desde el dashboard de administración"
            >
              <User className="size-3 mr-1" />
              Admin
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs"
              title="Inscrito desde el formulario web"
            >
              <Globe className="size-3 mr-1" />
              Web
            </Badge>
          )}
          {/* Badge de tipo de inscripción para invitados */}
          {inscripcion.tipoInscripcion === 'invitado' && (
            <Badge
              variant="outline"
              className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 text-xs"
              title="Invitado especial"
            >
              <Star className="size-3 mr-1" />
              Invitado
            </Badge>
          )}
          {esNueva(inscripcion) && (
            <Badge className="bg-emerald-500 text-white animate-pulse">✨ Nueva</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {inscripcion.convencion?.titulo || 'Sin convención'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Inscrito:{' '}
          {format(new Date(inscripcion.fechaInscripcion), "d 'de' MMMM, yyyy 'a las' HH:mm", {
            locale: es,
          })}
        </p>
        {inscripcion.codigoReferencia && (
          <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              🔖 Código de Referencia:
            </p>
            <p className="text-sm font-mono font-bold text-emerald-900 dark:text-emerald-100">
              {inscripcion.codigoReferencia}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <span>{inscripcion.email}</span>
        </div>
        {inscripcion.telefono && (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground" />
            <span>{inscripcion.telefono}</span>
          </div>
        )}
        {inscripcion.sede && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{inscripcion.sede}</span>
          </div>
        )}
        {(inscripcion.pais || inscripcion.provincia) && (
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              <span className="text-amber-600 dark:text-amber-400">
                {inscripcion.pais || ''}
              </span>
              {inscripcion.provincia && (
                <span className="text-muted-foreground">, {inscripcion.provincia}</span>
              )}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span>
            {format(new Date(inscripcion.fechaInscripcion), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={
            inscripcion.estado === 'confirmado'
              ? 'default'
              : inscripcion.estado === 'cancelado'
                ? 'destructive'
                : 'secondary'
          }
          className={inscripcion.estado === 'confirmado' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
        >
          {inscripcion.estado}
        </Badge>
        {pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas && (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CheckCircle2 className="size-3 mr-1" />
            Pago Completo
          </Badge>
        )}
        {/* Botón editar - Deshabilitado si todos los pagos están completados */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditar(inscripcion)}
          disabled={pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas}
          className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
              ? 'No se puede editar una inscripción con todos los pagos completados'
              : 'Editar información de la inscripción'
          }
        >
          <Pencil className="size-3 mr-1" />
          Editar
        </Button>
        {/* Botón cancelar (solo si no está cancelada ni confirmada) */}
        {inscripcion.estado !== 'cancelado' && inscripcion.estado !== 'confirmado' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancelar(inscripcion)}
            className="h-6 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <XCircle className="size-3 mr-1" />
            Cancelar
          </Button>
        )}
        {/* Botón rehabilitar (solo si está cancelada) */}
        {inscripcion.estado === 'cancelado' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRehabilitar(inscripcion.id)}
            disabled={isRehabilitando}
            className="h-6 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            {isRehabilitando ? (
              <Loader2 className="size-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="size-3 mr-1" />
            )}
            Rehabilitar
          </Button>
        )}
      </div>
    </div>
  )
}




