'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { usePaymentStatus, useProcessPayment, useProcessPaymentByPreference } from '@/lib/hooks/use-mercado-pago'
import { toast } from 'sonner'

function PagoPendienteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('preference_id')
  const status = searchParams.get('status')
  
  // Obtener estado del pago desde el backend (se actualiza automáticamente cada 5 segundos si está pendiente)
  const { data: paymentData, isLoading } = usePaymentStatus(paymentId)
  const processPayment = useProcessPayment()
  const processPaymentByPreference = useProcessPaymentByPreference()

  // Procesar webhook automáticamente cuando se detecta payment_id o preference_id
  useEffect(() => {
    if (!paymentId) return

    // Si es un payment_id válido (número, no preference_id con guiones)
    if (!paymentId.includes('-') && !isNaN(Number(paymentId))) {
      console.log('[PagoPendiente] Procesando webhook automáticamente para payment_id:', paymentId)
      
      // Procesar el webhook automáticamente
      processPayment.mutate(paymentId, {
        onSuccess: () => {
          console.log('[PagoPendiente] Webhook procesado exitosamente')
        },
        onError: (error) => {
          console.error('[PagoPendiente] Error procesando webhook:', error)
          // No mostrar error al usuario, el estado se actualizará con el polling
        },
      })
    } else if (paymentId.includes('-')) {
      // Si es un preference_id (tiene guiones), procesar por preference_id
      console.log('[PagoPendiente] Procesando webhook automáticamente para preference_id:', paymentId)
      
      processPaymentByPreference.mutate(paymentId, {
        onSuccess: (data) => {
          console.log('[PagoPendiente] Webhook procesado exitosamente:', data)
          if (data.payments.length === 0) {
            console.log('[PagoPendiente] No se encontraron pagos en Mercado Pago. El pago puede estar pendiente.')
          }
        },
        onError: (error) => {
          console.error('[PagoPendiente] Error procesando webhook por preference_id:', error)
          // No mostrar error al usuario, el estado se actualizará con el polling
        },
      })
    }
  }, [paymentId]) // Solo ejecutar una vez cuando se detecta el payment_id

  useEffect(() => {
    // Si el pago fue aprobado, redirigir a página de éxito
    if (paymentData && typeof paymentData === 'object' && 'status' in paymentData) {
      if (paymentData.status === 'approved') {
        toast.success('¡Pago aprobado!', {
          description: 'Tu pago ha sido confirmado exitosamente.',
        })
        if (paymentId) {
          setTimeout(() => {
            router.push(`/convencion/pago-exitoso?payment_id=${paymentId}`)
          }, 1500)
        }
      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
        // Si el pago fue rechazado, redirigir a página de fallido
        toast.error('Pago rechazado', {
          description: 'El pago no pudo ser procesado.',
        })
        if (paymentId) {
          setTimeout(() => {
            router.push(`/convencion/pago-fallido?payment_id=${paymentId}`)
          }, 1500)
        }
      }
    }
  }, [paymentData, paymentId, router])

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
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-white">Pago Pendiente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white/80">
                Tu pago está siendo procesado. Te notificaremos por email una vez que se confirme el pago.
              </p>
              
              {monto && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Monto:</p>
                  <p className="text-2xl font-bold text-amber-500">{monto}</p>
                </div>
              )}

              {paymentId && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-white/60">
                    ID de transacción: <span className="font-mono text-xs">{paymentId}</span>
                  </p>
                  {paymentData && 
                   typeof paymentData === 'object' && 
                   'status_detail' in paymentData && 
                   paymentData.status_detail && (
                    <p className="text-sm text-white/60">
                      Estado: <span className="capitalize">{paymentData.status_detail}</span>
                    </p>
                  )}
                </div>
              )}

              {isLoading && (
                <p className="text-sm text-white/60 mt-2">Verificando estado del pago...</p>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-white/80">
                <strong>Nota:</strong> Algunos métodos de pago pueden tardar hasta 48 horas en confirmarse. Te
                enviaremos un email cuando el pago sea aprobado.
              </p>
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
                onClick={() => router.push('/convencion/inscripcion')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar estado
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

export default function PagoPendientePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <PagoPendienteContent />
    </Suspense>
  )
}

