import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Step4ConfirmacionProps {
  onBack: () => void
}

export function Step4Confirmacion({ onBack }: Step4ConfirmacionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icono de éxito */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>¡Inscripción Completa!</Text>
        
        {/* Mensaje */}
        <Text style={styles.message}>
          Tu inscripción ha sido registrada exitosamente. Tus datos han sido enviados a AMVA Go para su revisión.
        </Text>

        {/* Información adicional */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Próximos pasos:</Text>
          <Text style={styles.infoText}>
            • Revisa tu correo electrónico para confirmación{'\n'}
            • Los pagos se han creado automáticamente{'\n'}
            • Puedes ver el estado desde tu perfil
          </Text>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={styles.button}
          onPress={onBack}
        >
          <Text style={styles.buttonText}>🏠 Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

