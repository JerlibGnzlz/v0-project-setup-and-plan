'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function InscripcionSuccessHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('inscripcion') === 'exito') {
      toast.success('¡Inscripción exitosa!', {
        description: 'Tu inscripción ha sido registrada correctamente. Te contactaremos pronto.',
        duration: 5000,
      })
      const url = new URL(window.location.href)
      url.searchParams.delete('inscripcion')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])
  return null
}
