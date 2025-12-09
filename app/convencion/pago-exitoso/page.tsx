'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { usePaymentStatus } from '@/lib/hooks/use-mercado-pago'
import { toast } from 'sonner'

function PagoExitosoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('preference_id')
  const status = searchParams.get('status')
  
  // Obtener estado del pago desde el backend si hay payment_id
  const { data: paymentData, isLoading, error } = usePaymentStatus(paymentId)

  useEffect(() => {
    if (paymentId) {
      console.log('[PagoExitoso] Payment ID recibido:', paymentId)
      console.log('[PagoExitoso] Status de URL:', status)
    }
  }, [paymentId, status])

  useEffect(() => {
    // Si el pago no está aprobado, mostrar advertencia
    if (paymentData && typeof paymentData === 'object' && 'status' in paymentData) {
      if (paymentData.status !== 'approved') {
        if (paymentData.status === 'pending' || paymentData.status === 'in_process') {
          toast.info('Tu pago está siendo procesado', {
            description: 'Te notificaremos cuando se confirme el pago.',
          })
        } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
          toast.error('El pago no fue aprobado', {
            description: 'Por favor, intenta nuevamente o contacta con soporte.',
          })
          // Redirigir a página de fallido después de 2 segundos
          if (paymentId) {
            setTimeout(() => {
              router.push(`/convencion/pago-fallido?payment_id=${paymentId}`)
            }, 2000)
          }
        }
      }
    }
  }, [paymentData, paymentId, router])

  // Mostrar loading mientras se obtiene el estado del pago
  if (isLoading && paymentId) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-white/80">Verificando estado del pago...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // Si hay error o el pago no está aprobado, mostrar mensaje apropiado
  const isApproved = 
    (paymentData && typeof paymentData === 'object' && 'status' in paymentData && paymentData.status === 'approved') || 
    status === 'approved'
  
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

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-white">¡Pago Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white/80">
                Tu pago ha sido procesado correctamente. Recibirás una confirmación por email en breve.
              </p>
              
              {monto && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Monto pagado:</p>
                  <p className="text-2xl font-bold text-emerald-500">{monto}</p>
                </div>
              )}

              {paymentId && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-white/60">
                    ID de transacción: <span className="font-mono text-xs">{paymentId}</span>
                  </p>
                  {paymentData && 
                   typeof paymentData === 'object' && 
                   'date_approved' in paymentData && 
                   paymentData.date_approved && (
                    <p className="text-sm text-white/60">
                      Fecha: {new Date(paymentData.date_approved).toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-400">
                    No se pudo verificar el estado del pago, pero si llegaste a esta página, el pago fue exitoso.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => router.push('/convencion/inscripcion')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Ver mi inscripción
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
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

export default function PagoExitosoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <PagoExitosoContent />
    </Suspense>
  )
}

