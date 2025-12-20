import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Clipboard from 'expo-clipboard'
import {
  CheckCircle2,
  Copy,
  Calendar,
  MapPin,
  CreditCard,
  Receipt,
  Upload,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native'
import { type Convencion } from '@api/convenciones'
import { inscripcionesApi, type Inscripcion } from '@api/inscripciones'
import { uploadApi, pickImage } from '@api/upload'
import { Alert as CustomAlert } from '@utils/alert'

interface InscripcionStatusScreenProps {
  convencion: Convencion
  inscripcion: Inscripcion
  onBack: () => void
}

interface Pago {
  id: string
  monto: number
  numeroCuota: number
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  comprobanteUrl?: string
  fechaPago?: string
  referencia?: string
}

export function InscripcionStatusScreen({
  convencion,
  inscripcion,
  onBack,
}: InscripcionStatusScreenProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingComprobante, setUploadingComprobante] = useState(false)
  const [pagoSeleccionado, setPagoSeleccionado] = useState<string | null>(null)
  const [inscripcionCompleta, setInscripcionCompleta] = useState<Inscripcion | null>(inscripcion)
  // Inicializar pagos desde la inscripción si ya vienen incluidos
  const [pagos, setPagos] = useState<Pago[]>(
    inscripcion.pagos && Array.isArray(inscripcion.pagos) ? (inscripcion.pagos as Pago[]) : []
  )

  // Cargar información completa de la inscripción con pagos
  useEffect(() => {
    const loadInscripcionCompleta = async () => {
      try {
        setLoading(true)
        const inscripcionData = await inscripcionesApi.getById(inscripcion.id)
        setInscripcionCompleta(inscripcionData)
        
        // Si la inscripción tiene pagos, cargarlos
        if (inscripcionData.pagos && Array.isArray(inscripcionData.pagos)) {
          console.log('📋 Pagos cargados:', inscripcionData.pagos.length)
          console.log('📋 Detalles de pagos:', JSON.stringify(inscripcionData.pagos, null, 2))
          setPagos(inscripcionData.pagos as Pago[])
        } else {
          console.log('⚠️ No se encontraron pagos en la inscripción')
          setPagos([])
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar la inscripción'
        console.error('Error cargando inscripción:', errorMessage)
        CustomAlert.alert('Error', 'No se pudo cargar la información de la inscripción', undefined, 'error')
      } finally {
        setLoading(false)
      }
    }

    void loadInscripcionCompleta()
  }, [inscripcion.id])

  const codigoReferencia = inscripcionCompleta?.codigoReferencia || `AMVA-2025-${inscripcion.id.substring(0, 6).toUpperCase()}`

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(codigoReferencia)
      CustomAlert.alert('Código copiado', 'El código de referencia ha sido copiado al portapapeles', undefined, 'success')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('Error copiando código:', errorMessage)
      CustomAlert.alert('Error', 'No se pudo copiar el código', undefined, 'error')
    }
  }

  const handleUploadComprobante = async (pagoId: string) => {
    try {
      setUploadingComprobante(true)
      setPagoSeleccionado(pagoId)

      const result = await pickImage()
      if (result && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri
        const uploadResponse = await uploadApi.uploadInscripcionDocumento(uri)

        // Actualizar el pago con el comprobante
        await pagosApi.updateComprobante(pagoId, uploadResponse.url)

        CustomAlert.alert('Éxito', 'Comprobante subido exitosamente', undefined, 'success')
        
        // Recargar la inscripción para obtener los datos actualizados
        const inscripcionData = await inscripcionesApi.getById(inscripcion.id)
        setInscripcionCompleta(inscripcionData)
        if (inscripcionData.pagos && Array.isArray(inscripcionData.pagos)) {
          setPagos(inscripcionData.pagos as Pago[])
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al subir el comprobante'
      console.error('Error subiendo comprobante:', errorMessage)
      CustomAlert.alert('Error', errorMessage, undefined, 'error')
    } finally {
      setUploadingComprobante(false)
      setPagoSeleccionado(null)
    }
  }

  const pagosPendientes = pagos.filter(p => p.estado === 'PENDIENTE')
  const pagosCompletados = pagos.filter(p => p.estado === 'COMPLETADO')
  const totalPagos = pagos.length
  const totalCompletados = pagosCompletados.length
  const porcentajeCompletado = totalPagos > 0 ? Math.round((totalCompletados / totalPagos) * 100) : 0

  const montoTotal = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
  const montoPagado = pagosCompletados.reduce((sum, p) => sum + Number(p.monto), 0)
  const montoPendiente = montoTotal - montoPagado

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estado de Inscripción</Text>
        </View>

        {/* Banner de estado */}
        <View style={styles.statusBanner}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={styles.statusBannerText}>Inscripción Pendiente de Pago</Text>
        </View>

        {/* Mensaje de bienvenida */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            ¡Hola {inscripcionCompleta?.nombre?.charAt(0) || 'U'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Ya tienes una inscripción activa para esta convención
          </Text>
        </View>

        {/* Código de Referencia */}
        <View style={styles.referenceCodeCard}>
          <Text style={styles.referenceCodeTitle}>CÓDIGO DE REFERENCIA PARA PAGOS</Text>
          <View style={styles.referenceCodeContainer}>
            <Text style={styles.referenceCode}>{codigoReferencia}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
              <Copy size={20} color="#fbbf24" />
            </TouchableOpacity>
          </View>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instrucciones para realizar el pago:</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1.</Text>
              <Text style={styles.instructionText}>
                Copia el código de referencia usando el botón de copiar
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2.</Text>
              <Text style={styles.instructionText}>
                Incluye este código en el concepto o descripción de tu transferencia bancaria
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3.</Text>
              <Text style={styles.instructionText}>
                Realiza la transferencia por el monto correspondiente a tu cuota
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4.</Text>
              <Text style={styles.instructionText}>
                Sube el comprobante de pago para que nuestro equipo pueda validarlo
              </Text>
            </View>
          </View>
        </View>

        {/* Estado de Pagos */}
        <View style={styles.paymentStatusCard}>
          <View style={styles.paymentStatusHeader}>
            <CreditCard size={20} color="#22c55e" />
            <Text style={styles.paymentStatusTitle}>Estado de Pagos</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${porcentajeCompletado}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{porcentajeCompletado}% completado</Text>
          </View>
          <View style={styles.paymentSummary}>
            <View style={styles.paymentSummaryItem}>
              <Text style={styles.paymentSummaryLabel}>Total</Text>
              <Text style={styles.paymentSummaryValue}>${montoTotal.toLocaleString('es-AR')}</Text>
            </View>
            <View style={styles.paymentSummaryItem}>
              <Text style={styles.paymentSummaryLabel}>Pagado</Text>
              <Text style={[styles.paymentSummaryValue, styles.paymentSummaryValueGreen]}>
                ${montoPagado.toLocaleString('es-AR')}
              </Text>
            </View>
            <View style={styles.paymentSummaryItem}>
              <Text style={styles.paymentSummaryLabel}>Pendiente</Text>
              <Text style={[styles.paymentSummaryValue, styles.paymentSummaryValueOrange]}>
                ${montoPendiente.toLocaleString('es-AR')}
              </Text>
            </View>
          </View>
          <Text style={styles.paymentCount}>
            {totalCompletados}/{totalPagos} cuotas • {totalCompletados} de {totalPagos}
          </Text>
        </View>

        {/* Lista de Pagos */}
        {pagos.length > 0 && (
          <View style={styles.paymentsListCard}>
            {pagos.map((pago, index) => {
              const numeroPago = pago.numeroCuota || index + 1
              const estaPendiente = pago.estado === 'PENDIENTE'
              const tieneComprobante = !!pago.comprobanteUrl
              const estaSubiendo = uploadingComprobante && pagoSeleccionado === pago.id

              return (
                <View key={pago.id} style={styles.paymentItem}>
                  <View style={styles.paymentItemHeader}>
                    <Text style={styles.paymentItemTitle}>Pago {numeroPago}</Text>
                    <View
                      style={[
                        styles.paymentStatusBadge,
                        estadoNormalizado === 'COMPLETADO' && styles.paymentStatusBadgeCompleted,
                        estadoNormalizado === 'PENDIENTE' && styles.paymentStatusBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentStatusBadgeText,
                          estadoNormalizado === 'COMPLETADO' && styles.paymentStatusBadgeTextCompleted,
                          estadoNormalizado === 'PENDIENTE' && styles.paymentStatusBadgeTextPending,
                        ]}
                      >
                        {estadoNormalizado === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.paymentAmount}>
                    ${Number(pago.monto).toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    (pesos argentinos)
                  </Text>
                  
                  {/* Estado del comprobante */}
                  {tieneComprobante ? (
                    <View style={styles.comprobanteUploaded}>
                      <CheckCircle2 size={16} color="#22c55e" />
                      <Text style={styles.comprobanteUploadedText}>Comprobante cargado</Text>
                    </View>
                  ) : null}

                  {/* Botón para subir comprobante (solo para pagos pendientes) */}
                  {estaPendiente && (
                    <View style={styles.paymentUploadSection}>
                      <Text style={styles.paymentUploadDescription}>
                        Sube el comprobante de transferencia bancaria para el Pago {numeroPago}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.paymentUploadButton,
                          estaSubiendo && styles.paymentUploadButtonDisabled,
                        ]}
                        onPress={() => handleUploadComprobante(pago.id)}
                        disabled={estaSubiendo || uploadingComprobante}
                      >
                        {estaSubiendo ? (
                          <View style={styles.paymentUploadButtonContent}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.paymentUploadButtonText}>Subiendo...</Text>
                          </View>
                        ) : (
                          <View style={styles.paymentUploadButtonContent}>
                            <Upload size={18} color="#fff" />
                            <Text style={styles.paymentUploadButtonText}>Subir Comprobante</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {!tieneComprobante && (
                        <View style={styles.paymentUploadWarning}>
                          <AlertCircle size={14} color="#ef4444" />
                          <Text style={styles.paymentUploadWarningText}>
                            No se aceptan fotos de personas o imágenes sin texto
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        ) : (
          <View style={styles.paymentsListCard}>
            <Text style={styles.noPaymentsText}>
              No hay pagos registrados para esta inscripción
            </Text>
          </View>
        )}

        {/* Información de Convención */}
        <View style={styles.convencionInfoCard}>
          <View style={styles.convencionInfoHeader}>
            <Calendar size={18} color="#22c55e" />
            <Text style={styles.convencionInfoTitle}>Convención</Text>
          </View>
          <Text style={styles.convencionInfoName}>{convencion.titulo}</Text>
          <View style={styles.convencionInfoDetails}>
            <View style={styles.convencionInfoRow}>
              <Calendar size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.convencionInfoText}>{fechaFormateada}</Text>
            </View>
            <View style={styles.convencionInfoRow}>
              <MapPin size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.convencionInfoText}>{convencion.ubicacion}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  referenceCodeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  referenceCodeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  referenceCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  referenceCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  instructionsContainer: {
    gap: 12,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 8,
  },
  instructionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  paymentStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  paymentStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentSummaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  paymentSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  paymentSummaryValueGreen: {
    color: '#22c55e',
  },
  paymentSummaryValueOrange: {
    color: '#f59e0b',
  },
  paymentCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  paymentsListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  paymentStatusBadgeCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  paymentStatusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  paymentStatusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fbbf24',
    textTransform: 'uppercase',
  },
  paymentStatusBadgeTextCompleted: {
    color: '#22c55e',
  },
  paymentStatusBadgeTextPending: {
    color: '#fbbf24',
  },
  paymentAmount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  comprobanteUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  comprobanteUploadedText: {
    fontSize: 12,
    color: '#22c55e',
  },
  paymentUploadSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 10,
  },
  paymentUploadDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  paymentUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  paymentUploadButtonDisabled: {
    opacity: 0.6,
  },
  paymentUploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentUploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  paymentUploadWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  paymentUploadWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#ef4444',
    lineHeight: 14,
  },
  uploadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  uploadDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  uploadWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  uploadWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444',
    lineHeight: 16,
  },
  convencionInfoCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  convencionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  convencionInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  convencionInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  convencionInfoDetails: {
    gap: 8,
  },
  convencionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  convencionInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  noPaymentsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingVertical: 20,
  },
})

