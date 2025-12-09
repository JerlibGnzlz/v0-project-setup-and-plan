'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCreatePaymentPreference, useMercadoPagoStatus } from '@/lib/hooks/use-mercado-pago'
import { toast } from 'sonner'
import { CreditCard, Loader2, AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Pago } from '@/lib/api/pagos'

interface MercadoPagoButtonProps {
  pago: Pago
  inscripcionId: string
  convencionTitulo: string
  nombreCompleto: string
  email: string
  telefono?: string
  onSuccess?: () => void
}

export function MercadoPagoButton({
  pago,
  inscripcionId,
  convencionTitulo,
  nombreCompleto,
  email,
  telefono,
  onSuccess,
}: MercadoPagoButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const createPreference = useCreatePaymentPreference()
  const { data: mercadoPagoStatus, isLoading: isLoadingStatus, error: statusError } = useMercadoPagoStatus()

  // Logging para diagnóstico
  console.log('[MercadoPagoButton] ==========================================')
  console.log('[MercadoPagoButton] Estado del pago:', pago.estado)
  console.log('[MercadoPagoStatus] Cargando:', isLoadingStatus)
  console.log('[MercadoPagoStatus] Datos:', mercadoPagoStatus)
  console.log('[MercadoPagoStatus] Error:', statusError)
  console.log('[MercadoPagoButton] ==========================================')

  // Mostrar loading mientras se verifica el estado
  if (isLoadingStatus) {
    return (
      <Button disabled className="w-full sm:w-auto bg-gray-500/20 text-gray-400 border-gray-500/30">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Verificando...
      </Button>
    )
  }

  // Si hay error al obtener el estado, mostrar mensaje
  if (statusError) {
    console.error('[MercadoPagoButton] Error al obtener estado:', statusError)
    return (
      <Button disabled className="w-full sm:w-auto bg-red-500/20 text-red-400 border-red-500/30">
        <AlertCircle className="mr-2 h-4 w-4" />
        Error al verificar Mercado Pago
      </Button>
    )
  }

  // Si Mercado Pago no está configurado, mostrar mensaje en lugar de ocultar
  if (mercadoPagoStatus && !mercadoPagoStatus.configured) {
    console.warn('[MercadoPagoButton] Mercado Pago no está configurado')
    return (
      <Button disabled className="w-full sm:w-auto bg-gray-500/20 text-gray-400 border-gray-500/30">
        <CreditCard className="mr-2 h-4 w-4" />
        Mercado Pago no disponible
      </Button>
    )
  }

  // Solo mostrar para pagos pendientes
  if (pago.estado !== 'PENDIENTE' && pago.estado !== 'Pendiente') {
    console.log('[MercadoPagoButton] Pago no está pendiente, no se muestra el botón')
    return null
  }

  const handlePagar = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))

      if (monto <= 0) {
        toast.error('Monto inválido', {
          description: 'El monto del pago debe ser mayor a cero',
        })
        setIsProcessing(false)
        return
      }

      // Crear preferencia de pago
      const preference = await createPreference.mutateAsync({
        inscripcionId,
        pagoId: pago.id,
        monto,
        descripcion: `${convencionTitulo} - Cuota ${pago.numeroCuota || 1}`,
        emailPayer: email,
        nombrePayer: nombreCompleto.split(' ')[0],
        apellidoPayer: nombreCompleto.split(' ').slice(1).join(' ') || nombreCompleto.split(' ')[0],
        telefonoPayer: telefono,
        numeroCuota: pago.numeroCuota || 1,
      })

      // Validar que la preferencia se creó correctamente
      if (!preference || typeof preference !== 'object') {
        console.error('[MercadoPagoButton] ❌ ERROR: Preferencia no válida:', preference)
        toast.error('Error al crear preferencia', {
          description: 'La respuesta del servidor no es válida. Por favor, intenta nuevamente.',
        })
        setIsProcessing(false)
        return
      }

      // Obtener la URL de checkout
      // CRÍTICO: En modo test, SIEMPRE usar sandbox_init_point
      // Las tarjetas de prueba SOLO funcionan en sandbox
      let checkoutUrl: string | undefined

      if (mercadoPagoStatus?.testMode) {
        // Modo test: OBLIGATORIO usar sandbox
        checkoutUrl = preference.sandbox_init_point
        if (!checkoutUrl || typeof checkoutUrl !== 'string') {
          console.error('[MercadoPagoButton] ❌ ERROR: Modo test activo pero no hay sandbox_init_point válido')
          console.error('[MercadoPagoButton] Preferencia recibida:', preference)
          toast.error('Error de configuración', {
            description: 'No se pudo obtener la URL de sandbox. Verifica las credenciales de Mercado Pago.',
          })
          setIsProcessing(false)
          return
        }
      } else {
        // Modo producción: usar init_point
        checkoutUrl = preference.init_point
        if (!checkoutUrl || typeof checkoutUrl !== 'string') {
          console.error('[MercadoPagoButton] ❌ ERROR: No hay init_point válido')
          console.error('[MercadoPagoButton] Preferencia recibida:', preference)
          toast.error('Error al crear preferencia', {
            description: 'No se pudo obtener la URL de pago',
          })
          setIsProcessing(false)
          return
        }
      }

      // Logging detallado (solo si preference es válida)
      if (preference && typeof preference === 'object') {
        console.log('[MercadoPagoButton] ==========================================')
        console.log('[MercadoPagoButton] Modo test:', mercadoPagoStatus?.testMode)
        console.log('[MercadoPagoButton] Preferencia ID:', 'id' in preference ? preference.id : 'N/A')
        console.log('[MercadoPagoButton] Init Point (prod):', 'init_point' in preference ? preference.init_point : 'N/A')
        console.log('[MercadoPagoButton] Sandbox Init Point (test):', 'sandbox_init_point' in preference ? preference.sandbox_init_point : 'N/A')
        console.log('[MercadoPagoButton] URL de checkout seleccionada:', checkoutUrl)
        console.log('[MercadoPagoButton] ¿Es sandbox?', checkoutUrl?.includes('sandbox'))
        console.log('[MercadoPagoButton] ==========================================')
      }
      
      // Validar que en modo test se use sandbox
      if (mercadoPagoStatus?.testMode && !checkoutUrl.includes('sandbox')) {
        console.error('[MercadoPagoButton] ❌ ERROR CRÍTICO: Modo test activo pero URL no es de sandbox!')
        toast.error('Error de configuración', {
          description: 'La URL de checkout no es de sandbox. Las tarjetas de prueba no funcionarán.',
        })
        setIsProcessing(false)
        return
      }

      // Redirigir a Mercado Pago
      window.location.href = checkoutUrl
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al procesar pago', {
        description: errorMessage,
      })
      setIsProcessing(false)
    }
  }

  const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
  const montoFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePagar}
        disabled={isProcessing || createPreference.isPending}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
      >
        {isProcessing || createPreference.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar {montoFormateado} con Mercado Pago
          </>
        )}
      </Button>
      <Alert variant="destructive" className="mt-4 text-sm text-red-300 bg-red-900/20 border-red-700/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-400">
          <strong>⚠️ IMPORTANTE:</strong> Si el pago no continúa después de hacer clic en "Continuar" en Mercado Pago, 
          <strong className="block mt-1">deshabilita uBlock Origin ANTES de intentar pagar</strong>. 
          El bloqueador impide que Mercado Pago complete el proceso de pago.
        </AlertDescription>
      </Alert>
    </div>
  )
}

