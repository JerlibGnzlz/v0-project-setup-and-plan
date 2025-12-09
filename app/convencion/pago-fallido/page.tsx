'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { usePaymentStatus } from '@/lib/hooks/use-mercado-pago'

function PagoFallidoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('preference_id')
  const status = searchParams.get('status')
  
  // Obtener estado del pago desde el backend
  const { data: paymentData, isLoading } = usePaymentStatus(paymentId)

  // Mostrar loading mientras se obtiene el estado del pago
  if (isLoading && paymentId) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                <p className="text-white/80">Verificando estado del pago...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const monto = 
    paymentData && 
    typeof paymentData === 'object' && 
    'transaction_amount' in paymentData && 
    paymentData.transaction_amount
      ? new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: ('currency_id' in paymentData && paymentData.currency_id) || 'ARS',
        }).format(paymentData.transaction_amount)
      : null

  const motivoRechazo = 
    paymentData && 
    typeof paymentData === 'object' && 
    'status_detail' in paymentData && 
    paymentData.status_detail
      ? paymentData.status_detail.replace(/_/g, ' ').toLowerCase()
      : null

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-white">Pago No Procesado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white/80">
                No se pudo procesar tu pago. Por favor, intenta nuevamente o contacta con soporte si el problema
                persiste.
              </p>
              
              {monto && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Monto intentado:</p>
                  <p className="text-2xl font-bold text-red-500">{monto}</p>
                </div>
              )}

              {paymentId && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-white/60">
                    ID de transacción: <span className="font-mono text-xs">{paymentId}</span>
                  </p>
                  {motivoRechazo && (
                    <p className="text-sm text-red-400">
                      Motivo: <span className="capitalize">{motivoRechazo}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => router.push('/convencion/inscripcion')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar nuevamente
              </Button>
              <Button
                onClick={() => router.push('/convencion/inscripcion')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Ver mi inscripción
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full text-white/70 hover:text-white hover:bg-white/5"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

export default function PagoFallidoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <PagoFallidoContent />
    </Suspense>
  )
}

