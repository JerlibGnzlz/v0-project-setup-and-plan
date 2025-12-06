/**
 * Utilidad para guardar y restaurar la posición de scroll
 * Mejora la UX permitiendo volver a la última sección visitada
 */

const STORAGE_KEY = 'amva_last_section'

/**
 * Guarda la sección activa en sessionStorage
 */
export function saveLastSection(sectionId: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, sectionId)
  }
}

/**
 * Obtiene la última sección guardada
 */
export function getLastSection(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(STORAGE_KEY)
  }
  return null
}

/**
 * Limpia la sección guardada
 */
export function clearLastSection(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Obtiene la URL de retorno con el hash de la última sección
 */
export function getReturnUrl(): string {
  const lastSection = getLastSection()
  if (lastSection && lastSection !== 'inicio') {
    return `/#${lastSection}`
  }
  return '/'
}

/**
 * Hace scroll a una sección específica
 */
export function scrollToSection(sectionId: string, offset: number = 80): void {
  if (typeof window === 'undefined') return

  const element = document.getElementById(sectionId)
  if (element) {
    const offsetTop = element.offsetTop - offset
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  }
}

/**
 * Restaura la posición de scroll desde la URL hash o sessionStorage
 */
export function restoreScrollPosition(): void {
  if (typeof window === 'undefined') return

  // Función para verificar si el DOM está listo
  const isDOMReady = () => {
    return document.readyState === 'complete' || document.readyState === 'interactive'
  }

  // Función para restaurar con retry
  const attemptRestore = (sectionId: string, retries = 5) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Esperar un poco más para que las animaciones se inicialicen
      setTimeout(() => {
        scrollToSection(sectionId)
        // Forzar visibilidad de elementos en viewport después del scroll
        setTimeout(() => {
          const elements = document.querySelectorAll('[class*="opacity-0"]')
          elements.forEach(el => {
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              // Si está en viewport, forzar visibilidad
              el.classList.remove('opacity-0')
              el.classList.add('opacity-100')
            }
          })
        }, 300)
      }, 200)
    } else if (retries > 0) {
      // Si el elemento no existe, reintentar
      setTimeout(() => attemptRestore(sectionId, retries - 1), 100)
    }
  }

  // Primero intentar desde el hash de la URL
  const hash = window.location.hash.replace('#', '')
  if (hash) {
    if (isDOMReady()) {
      attemptRestore(hash)
    } else {
      window.addEventListener('load', () => attemptRestore(hash))
    }
    return
  }

  // Si no hay hash, intentar desde sessionStorage
  const lastSection = getLastSection()
  if (lastSection && lastSection !== 'inicio') {
    if (isDOMReady()) {
      attemptRestore(lastSection)
    } else {
      window.addEventListener('load', () => attemptRestore(lastSection))
    }
  }
}
