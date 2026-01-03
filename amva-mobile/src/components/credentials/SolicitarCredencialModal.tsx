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
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { X, Clock } from 'lucide-react-native'
import { LoadingButton } from '../ui/LoadingButton'
import { FormField } from '../ui/FormField'
import { CustomPicker } from '../ui/CustomPicker'
import { TipoCredencial } from '@api/solicitudes-credenciales'
import type { Invitado } from '@api/invitado-auth'
import { paises } from '@utils/paises'

interface SolicitarCredencialModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: {
    tipo: TipoCredencial
    dni: string
    nombre: string
    apellido: string
    nacionalidad?: string
    fechaNacimiento?: string
    motivo?: string
  }) => Promise<void>
  invitado?: Invitado | null
  loading?: boolean
}

export function SolicitarCredencialModal({
  visible,
  onClose,
  onSubmit,
  invitado,
  loading = false,
}: SolicitarCredencialModalProps) {
  const [formData, setFormData] = useState({
    tipo: TipoCredencial.MINISTERIAL as TipoCredencial,
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

  // Pre-llenar formulario con datos del invitado
  useEffect(() => {
    if (invitado && visible) {
      setFormData(prev => ({
        ...prev,
        dni: invitado.dni || prev.dni,
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

  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.dni.trim()) {
      return
    }
    if (!formData.nombre.trim()) {
      return
    }
    if (!formData.apellido.trim()) {
      return
    }

    await onSubmit({
      tipo: formData.tipo,
      dni: formData.dni.trim(),
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      nacionalidad: formData.nacionalidad.trim() || undefined,
      fechaNacimiento: formData.fechaNacimiento.trim() || undefined,
      motivo: formData.motivo.trim() || undefined,
    })
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Solicitar Credencial</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalBodyContent}
            >
            {/* Tipo de Credencial */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Credencial *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.tipo === TipoCredencial.MINISTERIAL && styles.radioOptionSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, tipo: TipoCredencial.MINISTERIAL }))}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.tipo === TipoCredencial.MINISTERIAL && styles.radioTextSelected,
                    ]}
                  >
                    Ministerial
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    formData.tipo === TipoCredencial.CAPELLANIA && styles.radioOptionSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, tipo: TipoCredencial.CAPELLANIA }))}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.tipo === TipoCredencial.CAPELLANIA && styles.radioTextSelected,
                    ]}
                  >
                    Capellanía
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DNI */}
            <FormField
              label="DNI *"
              value={formData.dni}
              onChangeText={value => setFormData(prev => ({ ...prev, dni: value }))}
              placeholder="Número de documento"
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
                  // Scroll al campo cuando se enfoca
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                  }, 100)
                }}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <LoadingButton
              onPress={handleSubmit}
              loading={loading}
              title="Enviar Solicitud"
              variant="primary"
              style={[styles.modalButton, styles.modalButtonSubmit]}
            />
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
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
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
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
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

