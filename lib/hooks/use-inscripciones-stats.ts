import { useMemo } from 'react'
import { type Inscripcion } from '@/lib/api/inscripciones'
import { getPagosInfo } from './use-inscripcion-utils'

export interface InscripcionesStats {
  total: number
  nuevas: number
  hoy: number
  pendientes: number
  confirmadas: number
  conPagoCompleto: number
}

export function useInscripcionesStats(
  inscripciones: Inscripcion[],
  convenciones: Array<{ id: string; costo?: number | string }>
): InscripcionesStats {
  return useMemo(() => {
    const ahora = new Date()
    const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
    const hoy = new Date(ahora.setHours(0, 0, 0, 0))

    return {
      total: inscripciones.length,
      nuevas: inscripciones.filter((insc: any) => {
        const fechaInsc = new Date(insc.fechaInscripcion)
        return fechaInsc >= hace24Horas
      }).length,
      hoy: inscripciones.filter((insc: any) => {
        const fechaInsc = new Date(insc.fechaInscripcion)
        return fechaInsc >= hoy
      }).length,
      pendientes: inscripciones.filter((insc: any) => insc.estado === 'pendiente').length,
      confirmadas: inscripciones.filter((insc: any) => insc.estado === 'confirmado').length,
      conPagoCompleto: inscripciones.filter((insc: any) => {
        const convencion = convenciones.find((c: any) => c.id === insc.convencionId)
        const pagosInfo = getPagosInfo(insc, convencion)
        return pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
      }).length,
    }
  }, [inscripciones, convenciones])
}




