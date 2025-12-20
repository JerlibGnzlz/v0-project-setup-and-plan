import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Receipt,
} from 'lucide-react-native'
import { CustomPicker } from '@components/ui/CustomPicker'
import { type Convencion } from '@api/convenciones'
import { type Invitado } from '@api/invitado-auth'
import { inscripcionesApi } from '@api/inscripciones'
import { uploadApi, pickImage } from '@api/upload'
import { Alert } from '@utils/alert'
import { format } from 'date-fns'

interface Step2UnifiedFormProps {
  convencion: Convencion
  invitado: Invitado
  yaInscrito?: boolean
  inscripcionExistente?: any
  onComplete: () => void
  onBack: () => void
}

export function Step2UnifiedForm({
  convencion,
  invitado,
  yaInscrito = false,
  inscripcionExistente,
  onComplete,
  onBack,
}: Step2UnifiedFormProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({})

  // Pre-llenar con datos del invitado
  const nombreDefault = invitado.nombre || ''
  const apellidoDefault = invitado.apellido || ''

  const [formData, setFormData] = useState({
    nombre: nombreDefault,
    apellido: apellidoDefault,
    email: invitado.email || '',
    telefono: invitado.telefono || '',
    sede: invitado.sede || '',
    pais: 'Argentina',
    provincia: '',
    tipoInscripcion: 'Invitado',
    numeroCuotas: 3,
    dni: '',
    documentoUrl: '',
    notas: '',
  })

  // Lista de países
  const paises = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'España',
    'Estados Unidos',
    'Guatemala',
    'Honduras',
    'México',
    'Nicaragua',
    'Panamá',
    'Paraguay',
    'Perú',
    'República Dominicana',
    'Uruguay',
    'Venezuela',
    'Otro',
  ]

  // Provincias de Argentina
  const provinciasArgentina = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
    'Ciudad Autónoma de Buenos Aires',
  ]

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)
  const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const costo =
    typeof convencion.costo === 'number'
      ? Number(convencion.costo)
      : parseFloat(String(convencion.costo || 0))

  const montoPorCuota1 = Number(costo) || 0
  const montoPorCuota2 = Number(costo / 2) || 0
  const montoPorCuota3 = Number(costo / 3) || 0

  const handleChange = (field: string, value: any) => {
    if (field === 'numeroCuotas') {
      const numValue = typeof value === 'number' ? value : parseInt(String(value || '3'), 10)
      setFormData(prev => ({ ...prev, [field]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    if (!formData.apellido.trim() || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Correo electrónico inválido'
      }
    }
    if (formData.telefono && (formData.telefono.length < 8 || formData.telefono.length > 20)) {
      newErrors.telefono = 'El teléfono debe tener entre 8 y 20 caracteres'
    }
    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido'
    }
    if (formData.pais === 'Argentina' && !formData.provincia.trim()) {
      newErrors.provincia = 'La provincia es requerida para Argentina'
    }
    if (!formData.sede.trim() || formData.sede.trim().length < 2) {
      newErrors.sede = 'La sede debe tener al menos 2 caracteres'
    }
    if (formData.sede.trim().length > 200) {
      newErrors.sede = 'La sede no puede exceder 200 caracteres'
    }
    if (!formData.tipoInscripcion.trim()) {
      newErrors.tipoInscripcion = 'El tipo de inscripción es requerido'
    }
    if (formData.numeroCuotas < 1 || formData.numeroCuotas > 3) {
      newErrors.numeroCuotas = 'El número de cuotas debe ser entre 1 y 3'
    }
    if (formData.dni && formData.dni.length > 20) {
      newErrors.dni = 'El DNI no puede exceder 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUploadDocument = async () => {
    try {
      setUploadingDocument(true)
      const image = await pickImage()
      if (image) {
        setSelectedImageUri(image.uri)
        const response = await uploadApi.uploadInscripcionDocumento(image)
        setFormData(prev => ({ ...prev, documentoUrl: response.url }))
        Alert.alert('Éxito', 'Comprobante subido correctamente', undefined, 'success')
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al subir el comprobante'
      Alert.alert('Error', errorMessage, undefined, 'error')
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleSubmit = async () => {
    Keyboard.dismiss()

    if (yaInscrito) {
      Alert.alert('Ya inscrito', 'Ya estás inscrito en esta convención', undefined, 'info')
      return
    }

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError && inputRefs.current[firstError]) {
        setTimeout(() => {
          inputRefs.current[firstError]?.focus()
        }, 100)
      }
      Alert.alert(
        'Campos inválidos',
        'Por favor completa todos los campos requeridos correctamente',
        undefined,
        'warning',
      )
      return
    }

    try {
      setLoading(true)

      // Construir sede completa
      let sedeCompleta = formData.sede.trim()
      if (formData.pais === 'Argentina' && formData.provincia) {
        sedeCompleta = `${sedeCompleta} - ${formData.pais}, ${formData.provincia}`
      } else if (formData.pais) {
        sedeCompleta = `${sedeCompleta} - ${formData.pais}`
      }

      const datosInscripcion = {
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono?.trim() || undefined,
        sede: sedeCompleta,
        pais: formData.pais.trim() || undefined,
        provincia: formData.provincia.trim() || undefined,
        tipoInscripcion: formData.tipoInscripcion || 'Invitado',
        numeroCuotas: formData.numeroCuotas || 3,
        dni: formData.dni?.trim() || undefined,
        documentoUrl: formData.documentoUrl || undefined,
        notas: formData.notas?.trim() || undefined,
        origenRegistro: 'mobile',
      }

      await inscripcionesApi.create(datosInscripcion)

      Alert.alert(
        '✅ Inscripción exitosa',
        `Tu inscripción a "${convencion.titulo}" fue registrada correctamente. Recibirás un email de confirmación con todos los detalles.`,
        [
          {
            text: 'OK',
            onPress: onComplete,
          },
        ],
        'success',
      )
    } catch (error: unknown) {
      console.error('❌ Error creando inscripción:', error)
      let errorMessage = 'No se pudo registrar la inscripción. Intenta nuevamente.'

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string | string[]
              error?: {
                message?: string | string[]
              }
              errors?: Array<{
                property: string
                constraints?: Record<string, string>
              }>
            }
            status?: number
          }
        }

        const responseData = axiosError.response?.data

        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const validationErrors = responseData.errors.map(err => {
            const property = err.property || 'campo'
            const constraints = err.constraints || {}
            const messages = Object.values(constraints)
            return `${property}: ${messages.join(', ')}`
          })
          errorMessage = `Error de validación:\n${validationErrors.join('\n')}`
        } else if (responseData?.error?.message) {
          const message = responseData.error.message
          errorMessage = Array.isArray(message) ? message.join('\n') : message
        } else if (responseData?.message) {
          const message = responseData.message
          errorMessage = Array.isArray(message) ? message.join('\n') : message
        } else if (axiosError.response?.status === 400) {
          errorMessage =
            'Error de validación: Por favor verifica que todos los campos estén completos y sean válidos.'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      }

      Alert.alert('Error al crear la inscripción', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Completa tu Inscripción</Text>
            <Text style={styles.subtitle}>Revisa y confirma tus datos</Text>
          </View>

          {/* Información de Convención (Resumida) */}
          <View style={styles.convencionInfo}>
            <View style={styles.convencionInfoHeader}>
              <Calendar size={18} color="#22c55e" />
              <Text style={styles.convencionInfoTitle}>{convencion.titulo}</Text>
            </View>
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

          {/* Mensaje si ya está inscrito */}
          {yaInscrito && inscripcionExistente && (
            <View style={styles.yaInscritoContainer}>
              <View style={styles.yaInscritoCard}>
                <CheckCircle2 size={24} color="#22c55e" />
                <Text style={styles.yaInscritoTitle}>Ya estás inscrito</Text>
                <Text style={styles.yaInscritoText}>
                  Tu inscripción fue registrada el{' '}
                  {new Date(inscripcionExistente.fechaInscripcion).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.yaInscritoSubtext}>
                  Estado: <Text style={styles.estadoText}>{inscripcionExistente.estado}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* Selección de Plan de Pago */}
          {costo > 0 && (
            <View style={styles.paymentPlanContainer}>
              <View style={styles.paymentPlanHeader}>
                <CreditCard size={18} color="#22c55e" />
                <Text style={styles.paymentPlanTitle}>Plan de Pago</Text>
              </View>
              <View style={styles.cuotasContainer}>
                {[1, 2, 3].map(num => {
                  const monto = num === 1 ? montoPorCuota1 : num === 2 ? montoPorCuota2 : montoPorCuota3
                  const isSelected = formData.numeroCuotas === num
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.cuotaCard, isSelected && styles.cuotaCardSelected]}
                      onPress={() => handleChange('numeroCuotas', num)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <LinearGradient
                          colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <View style={styles.cuotaCardContent}>
                        <Text style={[styles.cuotaLabel, isSelected && styles.cuotaLabelSelected]}>
                          {num} {num === 1 ? 'cuota' : 'cuotas'}
                        </Text>
                        <Text style={[styles.cuotaValue, isSelected && styles.cuotaValueSelected]}>
                          ${monto.toFixed(2)} {num > 1 ? 'cada una' : ''}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <CheckCircle2 size={18} color="#22c55e" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
              <View style={styles.resumenContainer}>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Costo total:</Text>
                  <Text style={styles.resumenValue}>${costo.toFixed(2)}</Text>
                </View>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Monto por cuota:</Text>
                  <Text style={styles.resumenValue}>
                    ${(costo / formData.numeroCuotas).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Datos Personales */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color="#22c55e" />
              <Text style={styles.sectionTitle}>Datos Personales</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Nombre <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={ref => {
                    inputRefs.current['nombre'] = ref
                  }}
                  style={[styles.input, errors.nombre && styles.inputError]}
                  value={formData.nombre}
                  onChangeText={value => handleChange('nombre', value)}
                  placeholder="Ej: Juan (nombre para la convención)"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Apellido <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={ref => {
                    inputRefs.current['apellido'] = ref
                  }}
                  style={[styles.input, errors.apellido && styles.inputError]}
                  value={formData.apellido}
                  onChangeText={value => handleChange('apellido', value)}
                  placeholder="Ej: Pérez (apellido para la convención)"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                />
                {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Mail size={12} color="rgba(255, 255, 255, 0.6)" /> Correo electrónico{' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['email'] = ref
                }}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={value => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="tu@email.com (para confirmación de inscripción)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                editable={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Phone size={12} color="rgba(255, 255, 255, 0.6)" /> Teléfono
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['telefono'] = ref
                }}
                style={[styles.input, errors.telefono && styles.inputError]}
                value={formData.telefono}
                onChangeText={value => handleChange('telefono', value)}
                keyboardType="phone-pad"
                placeholder="+54 11 1234-5678 (contacto para la convención)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                País <Text style={styles.required}>*</Text>
              </Text>
              <CustomPicker
                items={paises.map(pais => ({ label: pais, value: pais }))}
                selectedValue={formData.pais}
                onValueChange={value => handleChange('pais', value)}
                placeholder="Selecciona tu país (para la convención AMVA)"
                error={errors.pais}
              />
              {errors.pais && <Text style={styles.errorText}>{errors.pais}</Text>}
            </View>

            {formData.pais === 'Argentina' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Provincia <Text style={styles.required}>*</Text>
                </Text>
                <CustomPicker
                  items={provinciasArgentina.map(prov => ({ label: prov, value: prov }))}
                  selectedValue={formData.provincia}
                  onValueChange={value => handleChange('provincia', value)}
                  placeholder="Selecciona tu provincia (convención AMVA)"
                  error={errors.provincia}
                />
                {errors.provincia && <Text style={styles.errorText}>{errors.provincia}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Iglesia / Sede <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['sede'] = ref
                }}
                style={[styles.input, errors.sede && styles.inputError]}
                value={formData.sede}
                onChangeText={value => handleChange('sede', value)}
                placeholder="Ej: Iglesia AMVA Buenos Aires (tu sede)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                autoCapitalize="words"
              />
              {errors.sede && <Text style={styles.errorText}>{errors.sede}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                DNI / Documento de Identidad
                <Text style={styles.optionalText}> (Para credenciales)</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['dni'] = ref
                }}
                style={[styles.input, errors.dni && styles.inputError]}
                value={formData.dni}
                onChangeText={value => handleChange('dni', value)}
                keyboardType="numeric"
                placeholder="Ej: 12345678 (para credenciales AMVA)"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                maxLength={20}
              />
              {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tipo de Inscripción <Text style={styles.required}>*</Text>
              </Text>
              <CustomPicker
                items={[
                  { label: 'Invitado', value: 'Invitado' },
                  { label: 'Pastor', value: 'Pastor' },
                  { label: 'Líder', value: 'Líder' },
                  { label: 'Miembro', value: 'Miembro' },
                ]}
                selectedValue={formData.tipoInscripcion}
                onValueChange={value => handleChange('tipoInscripcion', value)}
                placeholder="Selecciona tu rol (Invitado, Pastor, Líder, Miembro)"
                error={errors.tipoInscripcion}
              />
              {errors.tipoInscripcion && (
                <Text style={styles.errorText}>{errors.tipoInscripcion}</Text>
              )}
            </View>

            {/* Comprobante de Transferencia */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Receipt size={12} color="rgba(255, 255, 255, 0.6)" /> Comprobante de Transferencia
              </Text>
              <Text style={styles.helperText}>
                Sube una foto o captura del comprobante de transferencia bancaria
              </Text>
              {formData.documentoUrl ? (
                <View style={styles.documentUploaded}>
                  <CheckCircle2 size={16} color="#22c55e" />
                  <Text style={styles.documentUploadedText}>Comprobante cargado</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadDocument}
                  disabled={uploadingDocument}
                >
                  {uploadingDocument ? (
                    <ActivityIndicator color="#22c55e" />
                  ) : (
                    <>
                      <Receipt size={18} color="#22c55e" />
                      <Text style={styles.uploadButtonText}>Subir Comprobante</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {selectedImageUri && (
                <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas (Opcional)</Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['notas'] = ref
                }}
                style={[styles.input, styles.textArea]}
                value={formData.notas}
                onChangeText={value => handleChange('notas', value)}
                placeholder="Información adicional sobre tu inscripción a la convención AMVA..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              disabled={loading}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, (loading || yaInscrito) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading || yaInscrito}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Enviando...</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Confirmar Inscripción</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  convencionInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  convencionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  convencionInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
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
  paymentPlanContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  paymentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  paymentPlanTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  cuotasContainer: {
    gap: 10,
    marginBottom: 12,
  },
  cuotaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cuotaCardSelected: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  cuotaCardContent: {
    flex: 1,
  },
  cuotaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cuotaLabelSelected: {
    color: '#4ade80',
  },
  cuotaValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cuotaValueSelected: {
    color: '#22c55e',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  resumenContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resumenLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resumenValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  required: {
    color: '#ef4444',
  },
  optionalText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'normal',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    marginTop: 4,
  },
  helperText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  documentUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 10,
    padding: 12,
  },
  documentUploadedText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  yaInscritoContainer: {
    marginBottom: 20,
  },
  yaInscritoCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
  },
  yaInscritoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 8,
    marginBottom: 8,
  },
  yaInscritoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  yaInscritoSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  estadoText: {
    fontWeight: '600',
    color: '#22c55e',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
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
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})

