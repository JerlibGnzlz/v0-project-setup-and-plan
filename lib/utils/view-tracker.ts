/**
 * Utilidad optimizada para tracking de vistas de noticias
 * Implementa debounce y localStorage para evitar múltiples conteos
 * No bloquea la carga de la página
 *
 * IMPORTANTE: Cada noticia (slug) se cuenta de forma INDEPENDIENTE
 * - Si visitas noticia A → se cuenta 1 vista para A
 * - Si visitas noticia B → se cuenta 1 vista para B (independiente de A)
 * - Si vuelves a visitar A en menos de 24h → NO se cuenta de nuevo
 */

const VIEWED_KEY_PREFIX = 'amva_viewed_'
const DEBOUNCE_DELAY = 1000 // 1 segundo (reducido para mejor respuesta)

// Cache de vistas ya registradas en esta sesión (por slug)
const viewedCache = new Set<string>()

// Noticias que están siendo procesadas (para evitar duplicados durante el debounce)
const processingSet = new Set<string>()

/**
 * Verifica si una noticia ya fue vista en esta sesión o en localStorage
 * Cada noticia (slug) es independiente
 */
function hasBeenViewed(slug: string): boolean {
  console.log(`🔍 [hasBeenViewed] Verificando slug: "${slug}"`)

  if (!slug) {
    console.log(`⚠️ [hasBeenViewed] Slug inválido, retornando true`)
    return true // Slug inválido, no contar
  }

  // Verificar si ya está siendo procesada
  if (processingSet.has(slug)) {
    console.log(`⏸️ [hasBeenViewed] "${slug}" ya está en processingSet`)
    return true
  }

  // Verificar cache en memoria (solo para esta sesión)
  if (viewedCache.has(slug)) {
    console.log(`⏸️ [hasBeenViewed] "${slug}" ya está en viewedCache (sesión actual)`)
    return true
  }

  // Verificar localStorage (persiste entre sesiones)
  if (typeof window !== 'undefined') {
    const key = `${VIEWED_KEY_PREFIX}${slug}`
    const viewed = localStorage.getItem(key)
    console.log(`🔍 [hasBeenViewed] localStorage.getItem("${key}") =`, viewed)

    if (viewed) {
      const viewedDate = new Date(viewed)
      const now = new Date()

      // Validar que la fecha sea válida
      if (isNaN(viewedDate.getTime())) {
        // Fecha inválida, limpiar
        console.log(`🧹 [hasBeenViewed] Fecha inválida en localStorage, limpiando...`)
        localStorage.removeItem(key)
        return false
      }

      // Si fue vista en las últimas 24 horas, no contar de nuevo
      const hoursSinceView = (now.getTime() - viewedDate.getTime()) / (1000 * 60 * 60)
      console.log(`⏱️ [hasBeenViewed] "${slug}" fue vista hace ${hoursSinceView.toFixed(2)} horas`)

      if (hoursSinceView < 24) {
        viewedCache.add(slug)
        console.log(`✅ [hasBeenViewed] "${slug}" fue vista hace menos de 24h, retornando true`)
        return true
      } else {
        // Más de 24 horas, limpiar el registro viejo
        console.log(`🧹 [hasBeenViewed] "${slug}" fue vista hace más de 24h, limpiando registro...`)
        localStorage.removeItem(key)
        viewedCache.delete(slug)
      }
    } else {
      console.log(`✅ [hasBeenViewed] "${slug}" NO está en localStorage`)
    }
  }

  console.log(`✅ [hasBeenViewed] "${slug}" NO ha sido vista, retornando false`)
  return false
}

/**
 * Marca una noticia como vista
 */
function markAsViewed(slug: string): void {
  if (typeof window !== 'undefined' && slug) {
    viewedCache.add(slug)
    localStorage.setItem(`${VIEWED_KEY_PREFIX}${slug}`, new Date().toISOString())
  }
}

// Debounce para evitar múltiples llamadas (una por slug)
let debounceTimers: Map<string, NodeJS.Timeout> = new Map()

/**
 * Registra una vista de forma optimizada (con debounce)
 * Cada noticia (slug) se cuenta de forma INDEPENDIENTE
 * @param slug - El slug de la noticia
 * @param incrementVista - Función que incrementa la vista en el servidor
 * @param forceTrack - Si es true, fuerza el tracking incluso si ya fue vista (útil para noticias nuevas con 0 vistas)
 */
export function trackView(
  slug: string,
  incrementVista: (slug: string) => Promise<void> | void,
  forceTrack: boolean = false
): void {
  console.log(`🔍 [trackView] Llamado para slug: "${slug}", forceTrack: ${forceTrack}`)

  if (!slug) {
    console.warn('⚠️ [trackView] slug vacío, no se puede contar vista')
    return
  }

  // Si forceTrack es true, limpiar cualquier cache previo y forzar el tracking
  if (forceTrack && typeof window !== 'undefined') {
    const cacheKey = `${VIEWED_KEY_PREFIX}${slug}`
    if (localStorage.getItem(cacheKey)) {
      console.log(`🧹 [trackView] forceTrack=true, limpiando cache para "${slug}"`)
      localStorage.removeItem(cacheKey)
    }
    // Limpiar del cache en memoria
    viewedCache.delete(slug)
    processingSet.delete(slug)
  }

  // Verificar si ya fue vista (solo si no es forceTrack)
  if (!forceTrack) {
    const alreadyViewed = hasBeenViewed(slug)
    console.log(`🔍 [trackView] hasBeenViewed("${slug}") = ${alreadyViewed}`)

    if (alreadyViewed) {
      console.log(`⏭️ [trackView] Noticia "${slug}" ya fue vista, no se cuenta de nuevo`)
      return // Ya fue vista, no contar de nuevo
    }
  } else {
    console.log(`✅ [trackView] forceTrack=true, saltando verificación de cache para "${slug}"`)
  }

  console.log(`✅ [trackView] Noticia "${slug}" NO ha sido vista, procediendo a contar...`)

  // Limpiar timer anterior si existe (para este slug específico)
  const existingTimer = debounceTimers.get(slug)
  if (existingTimer) {
    clearTimeout(existingTimer)
    console.log(`🔄 [trackView] Timer anterior cancelado para "${slug}"`)
  }

  // Marcar como "en proceso" para evitar duplicados
  processingSet.add(slug)
  console.log(`⏳ [trackView] Marca "${slug}" como en proceso`)

  // Crear nuevo timer con debounce (una por slug)
  const timer = setTimeout(async () => {
    try {
      console.log(`🚀 [trackView] Ejecutando incremento de vista para "${slug}"...`)

      // Marcar como vista ANTES de hacer la llamada al servidor
      markAsViewed(slug)
      console.log(`✅ [trackView] Marca "${slug}" como vista en localStorage`)

      // Incrementar vista en el servidor
      console.log(`📞 [trackView] Llamando incrementVista("${slug}")...`)
      await incrementVista(slug)
      console.log(`✅ [trackView] incrementVista completado para "${slug}"`)

      console.log(`✅ [trackView] Vista registrada exitosamente para: ${slug}`)
    } catch (error) {
      console.error(`❌ [trackView] Error al registrar vista para ${slug}:`, error)
      // Si hay error, remover del cache para permitir reintento
      viewedCache.delete(slug)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${VIEWED_KEY_PREFIX}${slug}`)
      }
    } finally {
      // Limpiar timer y remover de procesamiento
      debounceTimers.delete(slug)
      processingSet.delete(slug)
      console.log(`🧹 [trackView] Limpieza completada para "${slug}"`)
    }
  }, DEBOUNCE_DELAY)

  debounceTimers.set(slug, timer)
  console.log(`⏱️ [trackView] Timer programado para "${slug}" en ${DEBOUNCE_DELAY}ms`)
}

/**
 * Formatea el número de vistas para mostrar
 */
export function formatViews(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

/**
 * Función de debug: muestra el estado del tracking
 * Útil para entender qué está pasando
 */
export function debugViewTracking(): {
  viewedInSession: string[]
  viewedInStorage: Array<{ slug: string; date: string; hoursAgo: number }>
  processing: string[]
} {
  const viewedInSession = Array.from(viewedCache)
  const processing = Array.from(processingSet)
  const viewedInStorage: Array<{ slug: string; date: string; hoursAgo: number }> = []

  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(VIEWED_KEY_PREFIX)) {
        const slug = key.replace(VIEWED_KEY_PREFIX, '')
        const dateStr = localStorage.getItem(key)
        if (dateStr) {
          const date = new Date(dateStr)
          const now = new Date()
          const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
          viewedInStorage.push({ slug, date: dateStr, hoursAgo })
        }
      }
    }
  }

  return {
    viewedInSession,
    viewedInStorage,
    processing,
  }
}

/**
 * Limpia el cache de vistas (útil para testing o reset)
 */
export function clearViewCache(): void {
  viewedCache.clear()
  processingSet.clear()
  debounceTimers.clear()

  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(VIEWED_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🧹 Cache de vistas limpiado. ${keysToRemove.length} entradas eliminadas.`)
  }
}
