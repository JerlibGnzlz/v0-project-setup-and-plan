'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { usePaymentStatus } from '@/lib/hooks/use-mercado-pago'

function PagoExitosoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('preference_id')
  
  // Obtener estado del pago desde el backend
  const { data: paymentData } = usePaymentStatus(paymentId)

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
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-white">¡Pago Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white/80">
                Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación en breve.
              </p>
              
              {monto && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Monto pagado:</p>
                  <p className="text-2xl font-bold text-emerald-500">{monto}</p>
                </div>
              )}

              {paymentId && (
                <div className="mt-4">
                  <p className="text-sm text-white/60">
                    ID de transacción: <span className="font-mono text-xs">{paymentId}</span>
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
                variant="ghost"
                className="w-full text-white/70 hover:text-white hover:bg-white/5"
              >
                <Home className="mr-2 h-4 w-4" />
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
