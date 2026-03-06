import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { X, Clock } from 'lucide-react-native'
import { LoadingButton } from '../ui/LoadingButton'
import { FormField } from '../ui/FormField'
import { CustomPicker } from '../ui/CustomPicker'
import { TipoCredencial } from '@api/solicitudes-credenciales'
import type { Invitado } from '@api/invitado-auth'
import { paises } from '@utils/paises'

/** Formatea DNI solo con dígitos a formato con puntos (ej: 95774063 → 95.774.063) */
function formatDniWithDots(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`
}

/** Deja solo dígitos del DNI (para guardar en estado al escribir) */
function normalizeDniInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

/** Opciones para tipo de pastor: select con Pastor/a, Reverendo/a, Obispo */
const TIPO_PASTOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'PASTOR', label: 'Pastor/a' },
  { value: 'REVERENDO', label: 'Reverendo/a' },
  { value: 'OBISPO', label: 'Obispo' },
]

/** Valores permitidos para tipo de credencial (backend espera minúsculas) */
const TIPO_CREDENCIAL_MIN = {
  ministerial: 'ministerial' as const,
  capellania: 'capellania' as const,
}

/** Longitudes máximas que acepta el backend */
const MAX_NOMBRE_APELLIDO = 100
const MIN_DNI_LEN = 5
const MAX_DNI_LEN = 30

interface SolicitarCredencialModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: {
    tipo: TipoCredencial
    dni: string
    nombre: string
    apellido: string
    tipoPastor?: string
    nacionalidad?: string
    fechaNacimiento?: string
    motivo?: string
  }) => Promise<void>
  invitado?: Invitado | null
  loading?: boolean
  /** Si el usuario ya tiene credencial ministerial, esa opción se deshabilita y se preselecciona capellanía */
  tieneMinisterial?: boolean
  /** Si el usuario ya tiene credencial de capellanía, esa opción se deshabilita y se preselecciona ministerial */
  tieneCapellania?: boolean
}

export function SolicitarCredencialModal({
  visible,
  onClose,
  onSubmit,
  invitado,
  loading = false,
  tieneMinisterial = false,
  tieneCapellania = false,
}: SolicitarCredencialModalProps) {
  const TOTAL_STEPS = 4
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tipo: TipoCredencial.MINISTERIAL as TipoCredencial,
    tipoPastor: 'PASTOR',
    dni: '',
    nombre: '',
    apellido: '',
    nacionalidad: '',
    fechaNacimiento: '',
    motivo: '',
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState<Date | null>(null)
  const scrollViewRef = React.useRef<ScrollView>(null)

  // Al abrir el modal: resetear paso y preseleccionar el tipo que aún no tiene
  useEffect(() => {
    if (visible) {
      const tipoPreseleccionado =
        tieneMinisterial && !tieneCapellania
          ? TipoCredencial.CAPELLANIA
          : !tieneMinisterial && tieneCapellania
            ? TipoCredencial.MINISTERIAL
            : TipoCredencial.MINISTERIAL
      setStep(1)
      setFormData({
        tipo: tipoPreseleccionado as TipoCredencial,
        tipoPastor: 'PASTOR',
        dni: '',
        nombre: '',
        apellido: '',
        nacionalidad: '',
        fechaNacimiento: '',
        motivo: '',
      })
      setFechaNacimientoDate(null)
    }
  }, [visible, tieneMinisterial, tieneCapellania])

  // Pre-llenar formulario con datos del invitado (después del reset)
  useEffect(() => {
    if (invitado && visible) {
      const dniRaw = (invitado.dni ?? '').replace(/\D/g, '').slice(0, 8)
      setFormData(prev => ({
        ...prev,
        dni: dniRaw || prev.dni,
        nombre: invitado.nombre || prev.nombre,
        apellido: invitado.apellido || prev.apellido,
        nacionalidad: invitado.nacionalidad || prev.nacionalidad,
      }))
    }
  }, [invitado, visible])

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setFechaNacimientoDate(selectedDate)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const fechaFormateada = `${year}-${month}-${day}`
      setFormData(prev => ({ ...prev, fechaNacimiento: fechaFormateada }))
    }
  }

  const canGoNext = (): boolean => {
    if (step === 1) return true
    if (step === 2) {
      if (!formData.dni.trim()) {
        Alert.alert('Falta un dato', 'Completa el DNI para continuar.')
        return false
      }
      if (!formData.nombre.trim()) {
        Alert.alert('Falta un dato', 'Completa el nombre para continuar.')
        return false
      }
      if (!formData.apellido.trim()) {
        Alert.alert('Falta un dato', 'Completa el apellido para continuar.')
        return false
      }
      return true
    }
    return true
  }

  const handleNext = () => {
    if (!canGoNext()) return
    if (step < TOTAL_STEPS) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    const nombre = formData.nombre.trim()
    const apellido = formData.apellido.trim()
    const dniDigits = formData.dni.trim().replace(/\D/g, '')

    if (!dniDigits || !nombre || !apellido) {
      Alert.alert('Falta un dato', 'Completa DNI, nombre y apellido para enviar.')
      return
    }
    if (dniDigits.length < MIN_DNI_LEN || dniDigits.length > MAX_DNI_LEN) {
      Alert.alert(
        'DNI inválido',
        `El DNI debe tener entre ${MIN_DNI_LEN} y ${MAX_DNI_LEN} caracteres (solo números).`
      )
      return
    }
    if (nombre.length > MAX_NOMBRE_APELLIDO || apellido.length > MAX_NOMBRE_APELLIDO) {
      Alert.alert(
        'Nombre o apellido largo',
        `Cada uno puede tener hasta ${MAX_NOMBRE_APELLIDO} caracteres.`
      )
      return
    }

    const tipoNormalized =
      formData.tipo === TipoCredencial.CAPELLANIA
        ? TIPO_CREDENCIAL_MIN.capellania
        : TIPO_CREDENCIAL_MIN.ministerial
    const tipoPastorValue =
      formData.tipo === TipoCredencial.MINISTERIAL
        ? (formData.tipoPastor?.trim() || 'PASTOR')
        : undefined
    const tipoPastorFinal =
      tipoPastorValue && TIPO_PASTOR_OPTIONS.some(o => o.value === tipoPastorValue)
        ? tipoPastorValue
        : formData.tipo === TipoCredencial.MINISTERIAL
          ? 'PASTOR'
          : undefined

    await onSubmit({
      tipo: tipoNormalized as TipoCredencial,
      dni: formatDniWithDots(formData.dni.trim()),
      nombre: nombre.slice(0, MAX_NOMBRE_APELLIDO),
      apellido: apellido.slice(0, MAX_NOMBRE_APELLIDO),
      tipoPastor: tipoPastorFinal,
      nacionalidad: formData.nacionalidad.trim() || undefined,
      fechaNacimiento: formData.fechaNacimiento.trim() || undefined,
      motivo: formData.motivo.trim() || undefined,
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modalOverlayContent}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss()
              onClose()
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalContentInner}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Solicitar Credencial</Text>
                  <Text style={styles.stepIndicator}>Paso {step} de {TOTAL_STEPS}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Indicador de progreso */}
              <View style={styles.progressBarContainer}>
                {[1, 2, 3, 4].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      i <= step && styles.progressDotActive,
                      i < step && styles.progressDotDone,
                    ]}
                  />
                ))}
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
            {/* Paso 1: Tipo de credencial y tipo de pastor (si ministerial) */}
            {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>¿Qué tipo de credencial necesitas?</Text>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tipo de Credencial *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      formData.tipo === TipoCredencial.MINISTERIAL && styles.radioOptionSelected,
                      tieneMinisterial && styles.radioOptionDisabled,
                    ]}
                    onPress={() =>
                      !tieneMinisterial && setFormData(prev => ({ ...prev, tipo: TipoCredencial.MINISTERIAL }))
                    }
                    disabled={tieneMinisterial}
                    activeOpacity={tieneMinisterial ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        formData.tipo === TipoCredencial.MINISTERIAL && styles.radioTextSelected,
                        tieneMinisterial && styles.radioTextDisabled,
                      ]}
                    >
                      Ministerial{tieneMinisterial ? ' (ya la tienes)' : ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      formData.tipo === TipoCredencial.CAPELLANIA && styles.radioOptionSelected,
                      tieneCapellania && styles.radioOptionDisabled,
                    ]}
                    onPress={() =>
                      !tieneCapellania && setFormData(prev => ({ ...prev, tipo: TipoCredencial.CAPELLANIA }))
                    }
                    disabled={tieneCapellania}
                    activeOpacity={tieneCapellania ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        formData.tipo === TipoCredencial.CAPELLANIA && styles.radioTextSelected,
                        tieneCapellania && styles.radioTextDisabled,
                      ]}
                    >
                      Capellanía{tieneCapellania ? ' (ya la tienes)' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {formData.tipo === TipoCredencial.MINISTERIAL && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tipo de Pastor *</Text>
                  <Text style={styles.formHint}>
                    Elige tu rol ministerial. Se guardará en la solicitud y en AMVA Digital.
                  </Text>
                  <CustomPicker
                    items={TIPO_PASTOR_OPTIONS}
                    selectedValue={formData.tipoPastor}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, tipoPastor: String(value) }))
                    }
                    placeholder="Selecciona tipo de pastor"
                  />
                </View>
              )}
            </View>
            )}

            {/* Paso 2: Datos personales */}
            {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Tus datos personales</Text>
              <Text style={styles.formHint}>
                Nombre, apellido y DNI son obligatorios para la solicitud.
              </Text>
            {/* DNI: se muestra con puntos (ej. 95.774.063), se guardan solo dígitos internamente */}
            <FormField
              label="DNI *"
              value={formatDniWithDots(formData.dni)}
              onChangeText={value =>
                setFormData(prev => ({ ...prev, dni: normalizeDniInput(value) }))
              }
              placeholder="Ej: 95.774.063"
              keyboardType="numeric"
              containerStyle={styles.formGroup}
            />

            {/* Nombre */}
            <FormField
              label="Nombre *"
              value={formData.nombre}
              onChangeText={value => setFormData(prev => ({ ...prev, nombre: value }))}
              placeholder="Tu nombre"
              containerStyle={styles.formGroup}
            />

            {/* Apellido */}
            <FormField
              label="Apellido *"
              value={formData.apellido}
              onChangeText={value => setFormData(prev => ({ ...prev, apellido: value }))}
              placeholder="Tu apellido"
              containerStyle={styles.formGroup}
            />
            </View>
            )}

            {/* Paso 3: Datos opcionales */}
            {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Datos opcionales</Text>
              <Text style={styles.formHint}>
                Nacionalidad, fecha de nacimiento y motivo ayudan a procesar tu solicitud.
              </Text>
            {/* Nacionalidad */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nacionalidad</Text>
              <CustomPicker
                items={paises.map(pais => ({ label: pais, value: pais }))}
                selectedValue={formData.nacionalidad || null}
                onValueChange={value => setFormData(prev => ({ ...prev, nacionalidad: String(value) }))}
                placeholder="Selecciona tu nacionalidad"
              />
            </View>

            {/* Fecha de Nacimiento */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha de Nacimiento</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <TextInput
                  style={styles.formInput}
                  placeholder="Selecciona tu fecha de nacimiento"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={formData.fechaNacimiento}
                  editable={false}
                  pointerEvents="none"
                />
                <Clock size={20} color="rgba(255, 255, 255, 0.5)" style={styles.dateIcon} />
              </TouchableOpacity>
              {showDatePicker && (
                <>
                  <DateTimePicker
                    value={fechaNacimientoDate || new Date(2000, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={styles.datePickerActions}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                        onPress={() => {
                          if (fechaNacimientoDate) {
                            handleDateChange(null, fechaNacimientoDate)
                          }
                          setShowDatePicker(false)
                        }}
                      >
                        <Text style={styles.datePickerButtonText}>Seleccionar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Motivo */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Motivo de la Solicitud</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Explica el motivo de tu solicitud..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={formData.motivo}
                onChangeText={value => setFormData(prev => ({ ...prev, motivo: value }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                  }, 100)
                }}
              />
            </View>
            </View>
            )}

            {/* Paso 4: Resumen */}
            {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Revisa tu solicitud</Text>
              <Text style={styles.formHint}>
                Confirma los datos antes de enviar. En AMVA Digital completarán foto y fechas si falta algo.
              </Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tipo: </Text>
                  <Text style={styles.summaryValue}>
                    {formData.tipo === TipoCredencial.CAPELLANIA ? 'Capellanía' : 'Ministerial'}
                  </Text>
                </View>
                {formData.tipo === TipoCredencial.MINISTERIAL && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tipo de pastor: </Text>
                    <Text style={styles.summaryValue}>
                      {TIPO_PASTOR_OPTIONS.find(o => o.value === formData.tipoPastor)?.label ?? formData.tipoPastor}
                    </Text>
                  </View>
                )}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nombre: </Text>
                  <Text style={styles.summaryValue}>{formData.nombre || '—'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Apellido: </Text>
                  <Text style={styles.summaryValue}>{formData.apellido || '—'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>DNI: </Text>
                  <Text style={styles.summaryValue}>
                    {formData.dni ? formatDniWithDots(formData.dni) : '—'}
                  </Text>
                </View>
                {(formData.nacionalidad || formData.fechaNacimiento || formData.motivo) && (
                  <>
                    {formData.nacionalidad && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Nacionalidad: </Text>
                        <Text style={styles.summaryValue}>{formData.nacionalidad}</Text>
                      </View>
                    )}
                    {formData.fechaNacimiento && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Fecha nac.: </Text>
                        <Text style={styles.summaryValue}>{formData.fechaNacimiento}</Text>
                      </View>
                    )}
                    {formData.motivo && (
                      <View style={[styles.summaryRow, styles.summaryMotivo]}>
                        <Text style={styles.summaryLabel}>Motivo: </Text>
                        <Text style={styles.summaryValue}>{formData.motivo}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            {step > 1 ? (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Anterior</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            {step < TOTAL_STEPS ? (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleNext}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Siguiente</Text>
              </TouchableOpacity>
            ) : (
              <LoadingButton
                onPress={handleSubmit}
                loading={loading}
                title="Enviar solicitud"
                variant="primary"
                style={[styles.modalButton, styles.modalButtonSubmit]}
              />
            )}
          </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1,
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    zIndex: 2,
    position: 'relative',
  },
  modalContentInner: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    overflow: 'hidden',
    flexDirection: 'column',
    maxHeight: 600,
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepIndicator: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#22c55e',
    transform: [{ scale: 1.2 }],
  },
  progressDotDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
  },
  stepContainer: {
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 6,
    fontSize: 15,
  },
  summaryValue: {
    color: '#fff',
    flex: 1,
    fontSize: 15,
  },
  summaryMotivo: {
    marginTop: 4,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
    minHeight: 300,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonSubmit: {
    backgroundColor: '#22c55e',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  formHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
    lineHeight: 18,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  formTextArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  radioOptionSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  radioText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  radioOptionDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.7,
  },
  radioTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#22c55e',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

