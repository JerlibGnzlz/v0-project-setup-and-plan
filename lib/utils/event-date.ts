/**
 * Utilidad única para la fecha del evento y la cuenta regresiva.
 * Todo se basa en YYYY-MM-DD y "medianoche en hora local" para que sea consistente
 * en todos los meses y zonas horarias (no depende de CSS ni de parsing ISO).
 */

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Convierte YYYY-MM-DD al timestamp de las 00:00:00 de ese día en hora local.
 * Usar solo esta función para la cuenta regresiva evita desfases en cualquier mes.
 */
export function dateOnlyToMidnightLocal(dateOnly: string): number | null {
  const trimmed = typeof dateOnly === 'string' ? dateOnly.trim() : ''
  const match = trimmed.match(DATE_ONLY_REGEX)
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const date = new Date(y, m - 1, d, 0, 0, 0)
  const ts = date.getTime()
  return Number.isNaN(ts) ? null : ts
}

export interface EventDateResult {
  dateOnly: string
  targetDate: Date
  formatted: string
}

/**
 * Extrae YYYY-MM-DD de la convención. Prioriza fechaInicioDateOnly (del API) y luego fechaInicio.
 */
function getDateOnlyString(convencion: {
  fechaInicio?: string | Date | null
  fechaInicioDateOnly?: string | null
}): string | null {
  if (convencion.fechaInicioDateOnly && DATE_ONLY_REGEX.test(convencion.fechaInicioDateOnly)) {
    return convencion.fechaInicioDateOnly
  }
  const raw = convencion.fechaInicio
  if (raw != null) {
    const str = typeof raw === 'string' ? raw.trim() : (raw as Date).toISOString?.() ?? String(raw)
    const candidate = str.length >= 10 ? str.slice(0, 10) : null
    if (candidate && DATE_ONLY_REGEX.test(candidate)) {
      return candidate
    }
  }
  return null
}

/**
 * Parsea "YYYY-MM-DD" a Date a medianoche en hora local (para cuenta regresiva correcta).
 */
function parseDateOnly(dateOnly: string): EventDateResult | null {
  const match = dateOnly.match(DATE_ONLY_REGEX)
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  const targetDate = new Date(y, m - 1, d, 0, 0, 0)
  if (Number.isNaN(targetDate.getTime())) return null
  return {
    dateOnly,
    targetDate,
    formatted: '', // el caller formatea con date-fns y locale
  }
}

/**
 * Dado una convención del API, devuelve la fecha del evento para countdown y label.
 * Misma fuente para ambos: el día en YYYY-MM-DD.
 */
export function getEventDate(
  convencion: { fechaInicio?: string | Date | null; fechaInicioDateOnly?: string | null } | null,
  formatFn: (date: Date) => string
): EventDateResult | null {
  if (!convencion) return null
  const dateOnly = getDateOnlyString(convencion)
  if (!dateOnly) return null
  const parsed = parseDateOnly(dateOnly)
  if (!parsed) return null
  return {
    ...parsed,
    formatted: formatFn(parsed.targetDate),
  }
}

/**
 * Formatea fecha del API (fechaInicio ISO o fechaInicioDateOnly) a dd/MM/yyyy
 * usando solo el día del calendario (YYYY-MM-DD). Así Admin y Landing muestran el mismo día.
 */
export function formatConvencionFechaDisplay(
  raw: string | Date | null | undefined,
  dateOnlyFallback?: string | null
): string {
  const dateOnly =
    dateOnlyFallback && DATE_ONLY_REGEX.test(String(dateOnlyFallback).trim())
      ? String(dateOnlyFallback).trim()
      : typeof raw === 'string' && raw.length >= 10 && DATE_ONLY_REGEX.test(raw.slice(0, 10))
        ? raw.slice(0, 10)
        : null
  if (!dateOnly) return '-'
  const [, y, m, d] = dateOnly.match(DATE_ONLY_REGEX)!.map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? '-' : `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}
