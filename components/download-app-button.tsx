'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Smartphone, Download, QrCode, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// URLs de las tiendas (actualizar cuando tengas las apps publicadas)
const APP_STORE_URL = 'https://apps.apple.com/app/amva' // Actualizar con URL real
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=org.vidaabundante.app' // Actualizar con URL real
const DEEP_LINK_SCHEME = 'amva-app://'

export function DownloadAppButton() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobile = /iphone|ipad|ipod|android/.test(userAgent)
      const ios = /iphone|ipad|ipod/.test(userAgent)
      const android = /android/.test(userAgent)

      setIsMobile(mobile)
      setIsIOS(ios)
      setIsAndroid(android)
    }
  }, [])

  const handleDownload = () => {
    if (isMobile) {
      // Intentar abrir la app con deep link
      const deepLink = `${DEEP_LINK_SCHEME}home`

      // Intentar abrir la app
      window.location.href = deepLink

      // Si después de 1 segundo no se abrió la app, redirigir a la tienda
      setTimeout(() => {
        if (isIOS) {
          window.location.href = APP_STORE_URL
        } else if (isAndroid) {
          window.location.href = PLAY_STORE_URL
        }
      }, 1000)
    } else {
      // Desktop: Mostrar QR code
      setShowQRDialog(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleDownload}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        size="lg"
      >
        <Smartphone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        AMVA app
        <Download className="w-4 h-4 ml-2 opacity-70" />
      </Button>

      {/* Dialog con QR Code y links para desktop */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Descargar App Móvil
            </DialogTitle>
            <DialogDescription>
              Escanea el código QR con tu dispositivo móvil o usa los enlaces directos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code placeholder - Reemplazar con QR real */}
            <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">QR Code generado dinámicamente</p>
                <p className="text-xs text-gray-400 mt-2">
                  (Implementar generación de QR con librería)
                </p>
              </div>
            </div>

            {/* Links directos */}
            <div className="flex flex-col gap-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0175C4] hover:bg-[#0165A8] text-white rounded-lg transition-colors"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-8"
                />
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1288838400"
                  alt="Download on the App Store"
                  className="h-8"
                />
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
