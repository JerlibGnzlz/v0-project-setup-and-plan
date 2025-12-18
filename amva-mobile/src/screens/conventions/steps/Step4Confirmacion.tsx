import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileText,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react-native'
import { type Convencion } from '@api/convenciones'
import { inscripcionesApi } from '@api/inscripciones'
import { Alert } from '@utils/alert'

interface Step4ConfirmacionProps {
  convencion: Convencion
  formData: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    sede: string
    pais?: string
    provincia?: string
    tipoInscripcion: string
    numeroCuotas: number
    dni?: string
    documentoUrl?: string
    notas?: string
  }
  onConfirm: () => void
  onBack: () => void
}

export function Step4Confirmacion({
  convencion,
  formData,
  onConfirm,
  onBack,
}: Step4ConfirmacionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)

  const formatoFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const costo =
    typeof convencion.costo === 'number'
      ? convencion.costo
      : parseFloat(String(convencion.costo || 0))

  const montoPorCuota = costo / formData.numeroCuotas

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)

      // Validar campos requeridos
      const camposFaltantes = []
      if (!formData.nombre || formData.nombre.trim().length === 0) camposFaltantes.push('nombre')
      if (!formData.apellido || formData.apellido.trim().length === 0)
        camposFaltantes.push('apellido')
      if (!formData.email || formData.email.trim().length === 0) camposFaltantes.push('email')
      if (!formData.sede || formData.sede.trim().length === 0) camposFaltantes.push('sede')

      if (camposFaltantes.length > 0) {
        Alert.alert(
          'Datos incompletos',
          `Faltan los siguientes campos: ${camposFaltantes.join(', ')}. Por favor, completa todos los campos requeridos antes de continuar.`,
          undefined,
          'warning',
        )
        setIsSubmitting(false)
        return
      }

      // Construir sede completa con país y provincia si están disponibles
      // Asegurar que formData.sede no tenga ya el país/provincia agregado
      let sedeBase = formData.sede.trim()
      
      // Remover cualquier duplicación si ya existe (por si acaso)
      if (formData.pais) {
        // Remover patrón " - Argentina, Provincia" o " - País"
        const pattern1 = ` - ${formData.pais}, ${formData.provincia || ''}`
        const pattern2 = ` - ${formData.pais}`
        
        if (sedeBase.includes(pattern1)) {
          sedeBase = sedeBase.replace(pattern1, '').trim()
        } else if (formData.provincia && sedeBase.includes(` - ${formData.pais},`)) {
          sedeBase = sedeBase.split(` - ${formData.pais},`)[0].trim()
        } else if (sedeBase.includes(pattern2)) {
          sedeBase = sedeBase.replace(pattern2, '').trim()
        }
      }
      
      // Construir sede completa solo una vez
      let sedeCompleta = sedeBase
      if (formData.pais === 'Argentina' && formData.provincia) {
        sedeCompleta = `${sedeBase} - ${formData.pais}, ${formData.provincia}`
      } else if (formData.pais) {
        sedeCompleta = `${sedeBase} - ${formData.pais}`
      }

      // Preparar datos para enviar
      const datosInscripcion = {
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono?.trim() || undefined,
        sede: sedeCompleta,
        pais: formData.pais?.trim() || undefined,
        provincia: formData.provincia?.trim() || undefined,
        tipoInscripcion: formData.tipoInscripcion || 'Invitado',
        numeroCuotas: formData.numeroCuotas || 3,
        dni: formData.dni?.trim() || undefined,
        origenRegistro: 'mobile',
        documentoUrl: formData.documentoUrl || undefined,
        notas: formData.notas?.trim() || undefined,
      }

      console.log('📤 Enviando inscripción:', JSON.stringify(datosInscripcion, null, 2))

      // Crear la inscripción
      await inscripcionesApi.create(datosInscripcion)

      Alert.alert(
        '✅ Inscripción exitosa',
        `Tu inscripción a "${convencion.titulo}" fue registrada correctamente. Recibirás un email de confirmación con todos los detalles.`,
        [
          {
            text: 'OK',
            onPress: onConfirm,
          },
        ],
        'success',
      )
    } catch (error: unknown) {
      console.error('Error creando inscripción:', error)
      let errorMessage = 'No se pudo registrar la inscripción. Intenta nuevamente.'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] }; status?: number } }
        if (axiosError.response?.data?.message) {
          const message = axiosError.response.data.message
          errorMessage = Array.isArray(message) ? message.join('\n') : message
        } else if (axiosError.response?.status === 400) {
          errorMessage = 'Error de validación: Por favor verifica que todos los campos estén completos y sean válidos.'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      }
      
      console.error('Detalles del error:', JSON.stringify(error, null, 2))
      Alert.alert('Error al crear la inscripción', errorMessage, undefined, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <CheckCircle2 size={14} color="#22c55e" />
            <Text style={styles.badgeText}>Revisa tu Inscripción</Text>
          </View>
          <Text style={styles.title}>Resumen y Confirmación</Text>
          <Text style={styles.subtitle}>
            Por favor, revisa todos los datos antes de confirmar tu inscripción
          </Text>
        </View>

        {/* Información de la Convención */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color="#22c55e" />
            <Text style={styles.sectionTitle}>Información de la Convención</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Convención:</Text>
            <Text style={styles.infoValue}>{convencion.titulo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fechas:</Text>
            <Text style={styles.infoValue}>
              {formatoFecha(fechaInicio)} al {formatoFecha(fechaFin)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{convencion.ubicacion}</Text>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>
              {formData.nombre} {formData.apellido}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{formData.email}</Text>
          </View>
          {formData.telefono && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{formData.telefono}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>País:</Text>
            <Text style={styles.infoValue}>
              {formData.pais}
              {formData.provincia ? `, ${formData.provincia}` : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Iglesia / Sede:</Text>
            <Text style={styles.infoValue}>{formData.sede}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Inscripción:</Text>
            <Text style={styles.infoValue} style={{ textTransform: 'capitalize' }}>
              {formData.tipoInscripcion}
            </Text>
          </View>
          {formData.dni && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DNI:</Text>
              <Text style={styles.infoValue}>{formData.dni}</Text>
            </View>
          )}
        </View>

        {/* Información de Pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Información de Pago</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan de pago:</Text>
            <Text style={styles.infoValue}>
              {formData.numeroCuotas} cuota{formData.numeroCuotas > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monto por cuota:</Text>
            <Text style={styles.infoValue}>${montoPorCuota.toFixed(2)}</Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Costo total:</Text>
            <Text style={styles.totalValue}>${costo.toFixed(2)}</Text>
          </View>
        </View>

        {/* Documento subido */}
        {formData.documentoUrl && (
          <View style={styles.section}>
            <View style={styles.documentContainer}>
              <CheckCircle2 size={16} color="#22c55e" />
              <Text style={styles.documentText}>Documento/comprobante: Subido</Text>
            </View>
          </View>
        )}

        {/* Notas */}
        {formData.notas && (
          <View style={styles.section}>
            <Text style={styles.notesLabel}>Notas adicionales:</Text>
            <Text style={styles.notesText}>{formData.notas}</Text>
          </View>
        )}

        {/* Mensaje informativo */}
        <View style={styles.infoBox}>
          <View style={styles.infoBoxHeader}>
            <AlertCircle size={16} color="#3b82f6" />
            <Text style={styles.infoBoxTitle}>¿Qué sigue después?</Text>
          </View>
          <Text style={styles.infoBoxText}>
            • Recibirás un email de confirmación con todos los detalles{'\n'}
            • Podrás realizar el pago de tus cuotas según el plan seleccionado{'\n'}
            • Nuestro equipo validará tus pagos y te notificará por email{'\n'}
            • Una vez completados todos los pagos, recibirás la confirmación final
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmButtonGradient}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} color="#fff" />
                  <Text style={styles.confirmButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirmar Inscripción</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '500',
  },
  notesLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#60a5fa',
  },
  infoBoxText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
