import { usePagos } from './use-pagos'
import { usePastores } from './use-pastores'
import { useInscripciones } from './use-inscripciones'

export interface DashboardStats {
  totalPastores: number
  pastoresActivos: number
  totalInscritos: number
  inscripcionesConfirmadas: number
  inscripcionesPendientes: number
  pagosConfirmados: number
  pagosParciales: number
  pagosPendientes: number
  totalRecaudado: number
  registrosManual: number
  registrosMobile: number
}

export function useDashboardStats() {
  const { data: pagosResponse } = usePagos()
  const { data: pastoresResponse } = usePastores()
  const { data: inscripcionesResponse } = useInscripciones()

  // Manejar respuesta paginada o array directo (compatibilidad)
  const pagos = Array.isArray(pagosResponse) ? pagosResponse : pagosResponse?.data || []
  const pastores = Array.isArray(pastoresResponse) ? pastoresResponse : pastoresResponse?.data || []
  const inscripciones = Array.isArray(inscripcionesResponse)
    ? inscripcionesResponse
    : inscripcionesResponse?.data || []

  const stats: DashboardStats = {
    totalPastores: pastores.length,
    pastoresActivos: pastores.filter((p: { activo: boolean }) => p.activo).length,
    totalInscritos: inscripciones.length,
    inscripcionesConfirmadas: inscripciones.filter((i: { estado: string }) => i.estado === 'confirmado')
      .length,
    inscripcionesPendientes: inscripciones.filter((i: { estado: string }) => i.estado === 'pendiente')
      .length,
    pagosConfirmados: pagos.filter((p: { estado: string }) => p.estado === 'COMPLETADO').length,
    pagosParciales: 0, // Se puede calcular basado en monto parcial
    pagosPendientes: pagos.filter((p: { estado: string }) => p.estado === 'PENDIENTE').length,
    totalRecaudado: pagos
      .filter((p: { estado: string }) => p.estado === 'COMPLETADO')
      .reduce(
        (acc: number, p: { monto: number | string }) => acc + Number(p.monto || 0),
        0
      ),
    registrosManual: inscripciones.filter(
      (i: { origenRegistro?: string }) =>
        i.origenRegistro === 'dashboard' || i.origenRegistro === 'web'
    ).length,
    registrosMobile: inscripciones.filter(
      (i: { origenRegistro?: string }) => i.origenRegistro === 'mobile'
    ).length,
  }

  return {
    stats,
    isLoading: false, // Los stats no necesitan loading state
  }
}

