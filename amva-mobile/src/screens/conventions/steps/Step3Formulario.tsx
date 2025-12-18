import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { type Convencion } from '@api/convenciones'
import { type Invitado } from '@api/invitado-auth'
import { inscripcionesApi } from '@api/inscripciones'
import { uploadApi, pickImage } from '@api/upload'

interface Step3FormularioProps {
  convencion: Convencion
  invitado: Invitado
  initialData?: any
  onComplete: () => void
  onBack: () => void
}

export function Step3Formulario({
  convencion,
  invitado,
  initialData,
  onComplete,
  onBack,
}: Step3FormularioProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({})

  // Pre-llenar con datos del invitado
  const nombreDefault = invitado.nombre || ''
  const apellidoDefault = invitado.apellido || ''

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || nombreDefault,
    apellido: initialData?.apellido || apellidoDefault,
    email: initialData?.email || invitado.email || '',
    telefono: initialData?.telefono || invitado.telefono || '',
    sede: initialData?.sede || invitado.sede || '',
    tipoInscripcion: initialData?.tipoInscripcion || 'invitado',
    numeroCuotas:
      typeof initialData?.numeroCuotas === 'number'
        ? initialData.numeroCuotas
        : initialData?.numeroCuotas
          ? parseInt(String(initialData.numeroCuotas), 10)
          : 3,
    dni: initialData?.dni || '', // DNI para relacionar con credenciales
    documentoUrl: initialData?.documentoUrl || '',
    notas: initialData?.notas || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)

  const handleChange = (field: string, value: any) => {
    // Asegurar que numeroCuotas sea siempre un número
    if (field === 'numeroCuotas') {
      const numValue = typeof value === 'number' ? value : parseInt(String(value || '3'), 10)
      setFormData(prev => ({ ...prev, [field]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleInputBlur = (field: string, value: string) => {
    // Validar y cerrar teclado si el campo está completo
    const trimmedValue = value?.trim() || ''

    // Si el campo está completo y válido, cerrar el teclado
    if (trimmedValue.length > 0) {
      // Validaciones específicas por campo
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(trimmedValue)) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      } else if (field === 'telefono') {
        // Si tiene al menos 8 dígitos, considerar completo
        const digitsOnly = trimmedValue.replace(/\D/g, '')
        if (digitsOnly.length >= 8) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      } else if (['nombre', 'apellido', 'sede'].includes(field)) {
        // Si tiene al menos 2 caracteres, considerar completo
        if (trimmedValue.length >= 2) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      }
    }
  }

  const inputPositions = useRef<{ [key: string]: number }>({})

  const handleInputFocus = (field: string) => {
    // Hacer scroll al input cuando se enfoca
    setTimeout(() => {
      const position = inputPositions.current[field]
      if (position !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: position - 120, // Offset para dejar espacio arriba
          animated: true,
        })
      }
    }, 300)
  }

  const handleInputLayout = (field: string, event: any) => {
    const { y } = event.nativeEvent.layout
    inputPositions.current[field] = y
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.apellido || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.sede || formData.sede.trim().length < 2) {
      newErrors.sede = 'La sede debe tener al menos 2 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectDocument = async () => {
    try {
      const uri = await pickImage()
      if (uri) {
        setSelectedImageUri(uri)
        // Subir inmediatamente
        await handleUploadDocument(uri)
      }
    } catch (error) {
      console.error('Error seleccionando documento:', error)
      Alert.alert('Error', 'No se pudo seleccionar el documento. Intenta nuevamente.')
    }
  }

  const handleUploadDocument = async (uri: string) => {
    try {
      setUploadingDocument(true)
      const response = await uploadApi.uploadInscripcionDocumento(uri)
      handleChange('documentoUrl', response.url)
      Alert.alert('Éxito', 'Documento subido correctamente')
    } catch (error: any) {
      console.error('Error subiendo documento:', error)
      Alert.alert('Error', 'No se pudo subir el documento. Intenta nuevamente.')
      setSelectedImageUri(null)
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleRemoveDocument = () => {
    setSelectedImageUri(null)
    handleChange('documentoUrl', '')
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Campos requeridos',
        'Por favor completa todos los campos requeridos correctamente.'
      )
      return
    }

    try {
      setLoading(true)

      await inscripcionesApi.create({
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        sede: formData.sede.trim(),
        tipoInscripcion: formData.tipoInscripcion,
        numeroCuotas:
          typeof formData.numeroCuotas === 'number'
            ? formData.numeroCuotas
            : parseInt(String(formData.numeroCuotas || 3), 10),
        dni: formData.dni.trim() || undefined, // DNI para relacionar con credenciales
        origenRegistro: 'mobile',
        documentoUrl: formData.documentoUrl || undefined,
        notas: formData.notas.trim() || undefined,
      })

      onComplete()
    } catch (error: any) {
      console.error('Error creando inscripción:', error)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo registrar la inscripción. Intenta nuevamente.'
      Alert.alert('Error', Array.isArray(message) ? message.join('\n') : message)
    } finally {
      setLoading(false)
    }
  }

  const costo =
    typeof convencion.costo === 'number'
      ? convencion.costo
      : parseFloat(String(convencion.costo || 0))

  // Asegurar que numeroCuotas sea un número
  const numeroCuotasNum =
    typeof formData.numeroCuotas === 'number'
      ? formData.numeroCuotas
      : parseInt(String(formData.numeroCuotas || 3), 10)

  const montoPorCuota = costo / numeroCuotasNum

  const requiredFields = ['nombre', 'apellido', 'email', 'sede']
  const requiredCompleted = requiredFields.filter(field => {
    const value = formData[field as keyof typeof formData]
    return value && typeof value === 'string' && value.trim().length > 0
  }).length
  const progress = (requiredCompleted / requiredFields.length) * 100

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Completa tu Inscripción</Text>
            <Text style={styles.subtitle}>
              Por favor, completa los siguientes datos para finalizar tu inscripción
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {requiredCompleted}/{requiredFields.length} campos requeridos completados
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
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
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('nombre')}
                  onBlur={() => handleInputBlur('nombre', formData.nombre)}
                  onLayout={e => handleInputLayout('nombre', e)}
                  onSubmitEditing={() => inputRefs.current['apellido']?.focus()}
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
                  placeholder="Tu apellido"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('apellido')}
                  onBlur={() => handleInputBlur('apellido', formData.apellido)}
                  onLayout={e => handleInputLayout('apellido', e)}
                  onSubmitEditing={() => inputRefs.current['email']?.focus()}
                />
                {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Correo electrónico <Text style={styles.required}>*</Text>
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
                placeholder="tu@email.com"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="next"
                onFocus={() => handleInputFocus('email')}
                onBlur={() => handleInputBlur('email', formData.email)}
                onLayout={e => handleInputLayout('email', e)}
                onSubmitEditing={() => inputRefs.current['telefono']?.focus()}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['telefono'] = ref
                }}
                style={styles.input}
                value={formData.telefono}
                onChangeText={value => handleChange('telefono', value)}
                keyboardType="phone-pad"
                placeholder="+54 11 1234-5678"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="next"
                onFocus={() => handleInputFocus('telefono')}
                onBlur={() => handleInputBlur('telefono', formData.telefono)}
                onLayout={e => handleInputLayout('telefono', e)}
                onSubmitEditing={() => inputRefs.current['sede']?.focus()}
              />
            </View>

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
                placeholder="Nombre de tu iglesia o sede"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() => handleInputFocus('sede')}
                onBlur={() => handleInputBlur('sede', formData.sede)}
                onLayout={e => handleInputLayout('sede', e)}
                onSubmitEditing={() => inputRefs.current['dni']?.focus()}
              />
              {errors.sede && <Text style={styles.errorText}>{errors.sede}</Text>}
            </View>

            {/* DNI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                DNI / Documento de Identidad
                <Text style={styles.helperText}> (Para credenciales)</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['dni'] = ref
                }}
                style={styles.input}
                value={formData.dni}
                onChangeText={value => handleChange('dni', value)}
                placeholder="Ej: 12345678"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                maxLength={20}
                returnKeyType="done"
                onFocus={() => handleInputFocus('dni')}
                onLayout={e => handleInputLayout('dni', e)}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <Text style={styles.helperText}>
                Ingresa tu DNI para poder consultar tus credenciales ministeriales y de capellanía
              </Text>
            </View>

            {/* Tipo de Inscripción y Número de Cuotas */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Tipo de Inscripción</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.tipoInscripcion}
                    onValueChange={value => handleChange('tipoInscripcion', value)}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="Pastor" value="pastor" color="#fff" />
                    <Picker.Item label="Líder" value="lider" color="#fff" />
                    <Picker.Item label="Miembro" value="miembro" color="#fff" />
                  </Picker>
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Número de Cuotas <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.numeroCuotas}
                    onValueChange={value => handleChange('numeroCuotas', value)}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item
                      label={`1 Cuota ($${Number(costo).toFixed(2)})`}
                      value={1}
                      color="#fff"
                    />
                    <Picker.Item
                      label={`2 Cuotas ($${Number(costo / 2).toFixed(2)} c/u)`}
                      value={2}
                      color="#fff"
                    />
                    <Picker.Item
                      label={`3 Cuotas ($${Number(costo / 3).toFixed(2)} c/u)`}
                      value={3}
                      color="#fff"
                    />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Documento/Comprobante (Opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Documento o Comprobante (Opcional)</Text>
              <Text style={styles.helperText}>
                Puedes subir un documento o comprobante relacionado con tu inscripción
              </Text>

              {formData.documentoUrl || selectedImageUri ? (
                <View style={styles.documentPreview}>
                  <Image
                    source={{ uri: selectedImageUri || formData.documentoUrl }}
                    style={styles.documentImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={handleRemoveDocument}
                    disabled={uploadingDocument}
                  >
                    <Text style={styles.removeButtonText}>✕ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadButton, uploadingDocument && styles.uploadButtonDisabled]}
                  onPress={handleSelectDocument}
                  disabled={uploadingDocument}
                >
                  {uploadingDocument ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.uploadButtonText}>📎 Seleccionar Documento</Text>
                      <Text style={styles.uploadButtonSubtext}>Desde galería o cámara</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Notas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas adicionales (opcional)</Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['notas'] = ref
                }}
                style={[styles.input, styles.textArea]}
                value={formData.notas}
                onChangeText={value => handleChange('notas', value)}
                multiline
                numberOfLines={4}
                placeholder="Información adicional que quieras compartir..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                textAlignVertical="top"
                onFocus={() => handleInputFocus('notas')}
                onLayout={e => handleInputLayout('notas', e)}
                returnKeyType="done"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={loading}>
                <Text style={styles.backButtonText}>← Atrás</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>✓ Confirmar Inscripción</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  documentPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  documentImage: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
