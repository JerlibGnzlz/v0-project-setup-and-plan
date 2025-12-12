import { usePagos } from './use-pagos'
import { usePastores } from './use-pastores'
import { useInscripciones } from './use-inscripciones'
import { useCredencialesPastorales, useCredencialPorVencer, useCredencialesVencidas } from './use-credenciales-pastorales'

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
  totalCredenciales: number
  credencialesVigentes: number
  credencialesPorVencer: number
  credencialesVencidas: number
}

export function useDashboardStats() {
  const { data: pagosResponse } = usePagos()
  const { data: pastoresResponse } = usePastores()
  const { data: inscripcionesResponse } = useInscripciones()
  const { data: credencialesResponse } = useCredencialesPastorales(1, 1000)
  const { data: credencialesPorVencer } = useCredencialPorVencer()
  const { data: credencialesVencidas } = useCredencialesVencidas()

  // Manejar respuesta paginada o array directo (compatibilidad)
  const pagos = Array.isArray(pagosResponse) ? pagosResponse : pagosResponse?.data || []
  const pastores = Array.isArray(pastoresResponse) ? pastoresResponse : pastoresResponse?.data || []
  const inscripciones = Array.isArray(inscripcionesResponse)
    ? inscripcionesResponse
    : inscripcionesResponse?.data || []
  const credenciales = credencialesResponse?.data || []
  const porVencer = credencialesPorVencer || []
  const vencidas = credencialesVencidas || []

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
    totalCredenciales: credenciales.filter((c: { activa: boolean }) => c.activa).length,
    credencialesVigentes: credenciales.filter((c: { estado: string; activa: boolean }) => c.estado === 'VIGENTE' && c.activa).length,
    credencialesPorVencer: porVencer.length,
    credencialesVencidas: vencidas.length,
  }

  return {
    stats,
    isLoading: false, // Los stats no necesitan loading state
  }
}

