import { type Inscripcion } from '@/lib/api/inscripciones'

export interface PagosInfo {
  cuotas: Array<{
    numero: number
    pago: any
    monto: number
    estado: string
  }>
  costoTotal: number
  montoPorCuota: number
  totalPagado: number
  cuotasPagadas: number
  cuotasPendientes: number
  numeroCuotas: number
  porcentajePagado: number
}

export function getPagosInfo(
  inscripcion: Inscripcion,
  convencion?: { costo?: number | string }
): PagosInfo {
  const pagos = inscripcion.pagos || []
  const costoTotal = convencion?.costo ? Number(convencion.costo) : 0
  const numeroCuotas = inscripcion.numeroCuotas || 3
  const montoPorCuota = numeroCuotas > 0 ? costoTotal / numeroCuotas : costoTotal

  const cuotas = Array.from({ length: numeroCuotas }, (_, i) => i + 1).map(numero => {
    const pago = pagos.find((p: any) => p.numeroCuota === numero)
    return {
      numero,
      pago,
      monto: montoPorCuota,
      estado: pago?.estado || 'PENDIENTE',
    }
  })

  const totalPagado = pagos
    .filter((p: any) => p.estado === 'COMPLETADO')
    .reduce(
      (sum: number, p: any) =>
        sum + (typeof p.monto === 'number' ? p.monto : parseFloat(p.monto || 0)),
      0
    )

  const cuotasPagadas = pagos.filter((p: any) => p.estado === 'COMPLETADO').length
  const cuotasPendientes = numeroCuotas - cuotasPagadas

  return {
    cuotas,
    costoTotal,
    montoPorCuota,
    totalPagado,
    cuotasPagadas,
    cuotasPendientes,
    numeroCuotas,
    porcentajePagado: costoTotal > 0 ? (totalPagado / costoTotal) * 100 : 0,
  }
}

export function esNueva(inscripcion: Inscripcion): boolean {
  const ahora = new Date()
  const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
  const fechaInsc = new Date(inscripcion.fechaInscripcion)
  return fechaInsc >= hace24Horas
}




















