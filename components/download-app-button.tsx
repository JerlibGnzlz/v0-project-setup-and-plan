'use client'

import { Button } from '@/components/ui/button'
import { Smartphone, Download } from 'lucide-react'

/**
 * URL del APK para descarga directa.
 * Por defecto usa el artefacto EAS actual. Para cambiar: NEXT_PUBLIC_APK_DOWNLOAD_URL en Vercel.
 * Los enlaces EAS expiran ~30 días; entonces actualiza esta URL o usa /downloads/amva-movil.apk.
 */
const DEFAULT_APK_URL = 'https://expo.dev/artifacts/eas/2Yt9kBNShiZFuNFEWstEq5.apk'
const APK_URL = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || DEFAULT_APK_URL

interface DownloadAppButtonProps {
  /** URL alternativa del APK (sobrescribe la variable de entorno si se pasa) */
  apkUrl?: string
}

export function DownloadAppButton({ apkUrl }: DownloadAppButtonProps) {
  const downloadUrl = apkUrl || APK_URL

  if (!downloadUrl) {
    return (
      <Button
        disabled
        className="w-full bg-white/10 text-white/50 cursor-not-allowed"
        size="lg"
      >
        <Smartphone className="w-5 h-5 mr-2" />
        Configurar URL del APK
      </Button>
    )
  }

  const isSameOrigin = downloadUrl.startsWith('/')
  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      {...(isSameOrigin && { download: 'amva-movil.apk' })}
      className="block w-full"
      aria-label="Descargar AMVA Móvil para Android"
    >
      <Button
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        size="lg"
      >
        <Smartphone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Descargar AMVA Móvil para Android (APK)
        <Download className="w-4 h-4 ml-2 opacity-70" />
      </Button>
    </a>
  )
}
