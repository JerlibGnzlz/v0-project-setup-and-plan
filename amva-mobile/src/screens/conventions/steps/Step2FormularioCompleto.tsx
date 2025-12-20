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
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Receipt,
  AlertCircle,
} from 'lucide-react-native'
import { CustomPicker } from '@components/ui/CustomPicker'
import { type Convencion } from '@api/convenciones'
import { type Invitado } from '@api/invitado-auth'
import { inscripcionesApi } from '@api/inscripciones'
import { uploadApi, pickImage } from '@api/upload'
import { Alert } from '@utils/alert'

interface Step2FormularioCompletoProps {
  convencion: Convencion
  invitado: Invitado
  yaInscrito?: boolean
  inscripcionExistente?: any
  onComplete: () => void
  onBack: () => void
}

export function Step2FormularioCompleto({
  convencion,
  invitado,
  yaInscrito = false,
  inscripcionExistente,
  onComplete,
  onBack,
}: Step2FormularioCompletoProps) {
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

  const formatoFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

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
    if (formData.telefono && formData.telefono.trim().length > 0) {
      const phoneDigits = formData.telefono.replace(/\D/g, '')
      if (phoneDigits.length < 8 || phoneDigits.length > 20) {
        newErrors.telefono = 'El teléfono debe tener entre 8 y 20 dígitos'
      }
    }
    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido'
    }
    if (formData.pais === 'Argentina' && !formData.provincia.trim()) {
      newErrors.provincia = 'La provincia es requerida para Argentina'
    }
    if (!formData.sede.trim() || formData.sede.trim().length < 2) {
      newErrors.sede = 'La sede debe tener al menos 2 caracteres'
    } else if (formData.sede.trim().length > 200) {
      newErrors.sede = 'La sede no puede exceder 200 caracteres'
    }
    if (!formData.tipoInscripcion || formData.tipoInscripcion.trim().length === 0) {
      newErrors.tipoInscripcion = 'El tipo de inscripción es requerido'
    }
    if (formData.dni && formData.dni.trim().length > 20) {
      newErrors.dni = 'El DNI no puede exceder 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUploadDocument = async () => {
    try {
      setUploadingDocument(true)
      const image = await pickImage()
      if (!image) {
        setUploadingDocument(false)
        return
      }

      setSelectedImageUri(image.uri)
      const response = await uploadApi.uploadInscripcionDocumento(image)
      handleChange('documentoUrl', response.url)
      Alert.alert('✅ Éxito', 'Comprobante subido correctamente', undefined, 'success')
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
        inputRefs.current[firstError]?.focus()
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
        sedeCompleta = `${formData.sede.trim()} - ${formData.pais}, ${formData.provincia}`
      } else if (formData.pais) {
        sedeCompleta = `${formData.sede.trim()} - ${formData.pais}`
      }

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

  const scrollToInput = (inputRef: React.RefObject<TextInput | null>, offset: number = 0) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measureLayout(
          scrollViewRef.current as any,
          (_x: number, y: number) => {
            scrollViewRef.current?.scrollTo({
              y: y - 100 + offset,
              animated: true,
            })
          },
          () => {},
        )
      }
    }, 100)
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
        {/* Información de Convención (Resumida) */}
        <View style={styles.convencionCard}>
          <View style={styles.convencionHeader}>
            <Calendar size={18} color="#22c55e" />
            <Text style={styles.convencionTitle}>{convencion.titulo}</Text>
          </View>
          <View style={styles.convencionInfo}>
            <View style={styles.convencionInfoRow}>
              <Calendar size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.convencionInfoText}>{formatoFecha(fechaInicio)}</Text>
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

        {/* Formulario */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <User size={20} color="#22c55e" />
            <Text style={styles.formTitle}>Datos Personales</Text>
          </View>

          {/* Nombre y Apellido */}
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
                onFocus={() => scrollToInput(inputRefs.current['nombre'])}
              />
              {errors.nombre && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.nombre}</Text>
                </View>
              )}
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
                onFocus={() => scrollToInput(inputRefs.current['apellido'])}
              />
              {errors.apellido && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.apellido}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Email */}
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
              onFocus={() => scrollToInput(inputRefs.current['email'])}
            />
            {errors.email && (
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            )}
            <Text style={styles.helperText}>Este campo no se puede modificar</Text>
          </View>

          {/* Teléfono */}
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
              onFocus={() => scrollToInput(inputRefs.current['telefono'])}
            />
            {errors.telefono && (
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.telefono}</Text>
              </View>
            )}
          </View>

          {/* País */}
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
            {errors.pais && (
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.pais}</Text>
              </View>
            )}
          </View>

          {/* Provincia (solo para Argentina) */}
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
              {errors.provincia && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.provincia}</Text>
                </View>
              )}
            </View>
          )}

          {/* Sede */}
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
              onFocus={() => scrollToInput(inputRefs.current['sede'])}
            />
            {errors.sede && (
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.sede}</Text>
              </View>
            )}
          </View>

          {/* DNI */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              DNI / Documento de Identidad{' '}
              <Text style={styles.helperText}>(Para credenciales)</Text>
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
              onFocus={() => scrollToInput(inputRefs.current['dni'])}
            />
            {errors.dni && (
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.dni}</Text>
              </View>
            )}
            <Text style={styles.helperText}>
              Ingresa tu DNI para poder consultar tus credenciales ministeriales y de capellanía
            </Text>
          </View>

          {/* Tipo de Inscripción */}
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
              <View style={styles.errorContainer}>
                <AlertCircle size={12} color="#ef4444" />
                <Text style={styles.errorText}>{errors.tipoInscripcion}</Text>
              </View>
            )}
          </View>

          {/* Plan de Pago */}
          {costo > 0 && (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <CreditCard size={18} color="#f59e0b" />
                <Text style={styles.paymentTitle}>Plan de Pago</Text>
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
                      <Text style={[styles.cuotaLabel, isSelected && styles.cuotaLabelSelected]}>
                        {num} {num === 1 ? 'Cuota' : 'Cuotas'}
                      </Text>
                      <Text style={[styles.cuotaValue, isSelected && styles.cuotaValueSelected]}>
                        ${monto.toFixed(2)}
                      </Text>
                      <Text style={[styles.cuotaSubtext, isSelected && styles.cuotaSubtextSelected]}>
                        {num === 1 ? 'Pago único' : num === 2 ? 'c/u' : '⭐ Recomendado'}
                      </Text>
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

          {/* Comprobante de Transferencia */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Receipt size={12} color="rgba(255, 255, 255, 0.6)" /> Comprobante de Transferencia
            </Text>
            <Text style={styles.helperText}>
              Sube una foto o captura del comprobante de transferencia bancaria
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadDocument}
              disabled={uploadingDocument}
              activeOpacity={0.7}
            >
              {uploadingDocument ? (
                <ActivityIndicator color="#22c55e" />
              ) : formData.documentoUrl ? (
                <View style={styles.uploadSuccess}>
                  <CheckCircle2 size={18} color="#22c55e" />
                  <Text style={styles.uploadSuccessText}>Comprobante cargado</Text>
                </View>
              ) : (
                <View style={styles.uploadContent}>
                  <Receipt size={20} color="#22c55e" />
                  <Text style={styles.uploadText}>Subir comprobante</Text>
                </View>
              )}
            </TouchableOpacity>
            {selectedImageUri && (
              <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
            )}
          </View>

          {/* Notas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas (Opcional)</Text>
            <TextInput
              ref={ref => {
                inputRefs.current['notas'] = ref
              }}
              style={[styles.textArea, errors.notas && styles.inputError]}
              value={formData.notas}
              onChangeText={value => handleChange('notas', value)}
              placeholder="Información adicional sobre tu inscripción a la convención AMVA..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => scrollToInput(inputRefs.current['notas'])}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
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
  convencionCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  convencionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  convencionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  convencionInfo: {
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
  yaInscritoContainer: {
    marginBottom: 16,
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
    textAlign: 'center',
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
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    minHeight: 100,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  paymentCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cuotasContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  cuotaCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
  },
  cuotaCardSelected: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cuotaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cuotaLabelSelected: {
    color: '#4ade80',
    fontWeight: '600',
  },
  cuotaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  cuotaValueSelected: {
    color: '#22c55e',
  },
  cuotaSubtext: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  cuotaSubtextSelected: {
    color: '#4ade80',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  resumenContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resumenLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadSuccessText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
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
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})

