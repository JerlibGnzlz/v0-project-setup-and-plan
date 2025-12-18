import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native'
import { ChevronDown, Check } from 'lucide-react-native'

interface PickerItem {
  label: string
  value: string | number
}

interface CustomPickerProps {
  selectedValue: string | number | null | undefined
  onValueChange: (value: string | number) => void
  items: PickerItem[]
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

export function CustomPicker({
  selectedValue,
  onValueChange,
  items,
  placeholder = 'Selecciona una opción',
  label,
  error,
  required = false,
  disabled = false,
}: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false)

  const selectedItem = items.find(item => item.value === selectedValue)

  const handleSelect = (value: string | number) => {
    console.log('🔍 CustomPicker: Seleccionando valor:', value)
    onValueChange(value)
    setModalVisible(false)
  }

  const handleOpenModal = () => {
    if (!disabled) {
      console.log('🔍 CustomPicker: Abriendo modal, items disponibles:', items.length)
      setModalVisible(true)
    }
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          error && styles.pickerButtonError,
          disabled && styles.pickerButtonDisabled,
        ]}
        onPress={handleOpenModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerButtonText,
            !selectedItem && styles.pickerButtonTextPlaceholder,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <ChevronDown size={20} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              console.log('🔍 CustomPicker: Cerrando modal desde overlay')
              setModalVisible(false)
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Selecciona una opción'}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('🔍 CustomPicker: Cerrando modal desde botón')
                  setModalVisible(false)
                }}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={18} color="#22c55e" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              }}
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={true}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  required: {
    color: '#ef4444',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 14,
    minHeight: 56,
  },
  pickerButtonError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
  },
  pickerButtonTextPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#0d1f35',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalList: {
    flex: 1,
  },
  modalListContent: {
    padding: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  modalItemText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  modalItemTextSelected: {
    color: '#22c55e',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 12,
  },
})

