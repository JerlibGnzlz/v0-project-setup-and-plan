import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Calendar, MapPin, Ticket, Star, CheckCircle2, CreditCard, ArrowRight } from 'lucide-react-native'
import { type Convencion } from '@api/convenciones'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Step2ConvencionInfoProps {
  convencion: Convencion
  yaInscrito?: boolean
  inscripcionExistente?: any
  onComplete: (data?: { numeroCuotas?: number }) => void
  onBack: () => void
  initialNumeroCuotas?: number
}

export function Step2ConvencionInfo({
  convencion,
  yaInscrito = false,
  inscripcionExistente,
  onComplete,
  onBack,
  initialNumeroCuotas = 3,
}: Step2ConvencionInfoProps) {
  const [numeroCuotas, setNumeroCuotas] = useState<number>(initialNumeroCuotas)
  // Usar parseISO para evitar problemas de zona horaria
  const fechaInicio = parseISO(convencion.fechaInicio)
  const fechaFin = parseISO(convencion.fechaFin)

  const formatoFecha = (fecha: Date) => {
    return format(fecha, 'dd/MM/yyyy', { locale: es })
  }

  const costo =
    typeof convencion.costo === 'number'
      ? Number(convencion.costo)
      : parseFloat(String(convencion.costo || 0))

  // Asegurar que sean números válidos
  const montoPorCuota1 = Number(costo) || 0
  const montoPorCuota2 = Number(costo / 2) || 0
  const montoPorCuota3 = Number(costo / 3) || 0

  const handleContinue = () => {
    if (yaInscrito) {
      return
    }
    onComplete({ numeroCuotas })
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Inscripción Abierta</Text>
          </View>
          <Text style={styles.title}>{convencion.titulo}</Text>
          {convencion.descripcion && (
            <Text style={styles.description}>{convencion.descripcion}</Text>
          )}
        </View>

        {/* Image */}
        {convencion.imagenUrl && (
          <Image source={{ uri: convencion.imagenUrl }} style={styles.image} resizeMode="cover" />
        )}

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatoFecha(fechaInicio)}</Text>
            {fechaInicio.getTime() !== fechaFin.getTime() && (
              <Text style={styles.infoSubtext}>Hasta {formatoFecha(fechaFin)}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Ubicación</Text>
            <Text style={styles.infoValue}>{convencion.ubicacion}</Text>
          </View>
        </View>

        {/* Costo y Selección de Cuotas */}
        {costo > 0 && (
          <View style={styles.costoContainer}>
            <View style={styles.costoHeader}>
              <Text style={styles.costoLabel}>Costo Total</Text>
              <Text style={styles.costoValue}>${Number(costo).toFixed(2)}</Text>
            </View>

            <Text style={styles.cuotasTitle}>
              Selecciona tu plan de pago <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.cuotasContainer}>
              <TouchableOpacity
                style={[
                  styles.cuotaCard,
                  numeroCuotas === 1 && styles.cuotaCardSelected,
                ]}
                onPress={() => setNumeroCuotas(1)}
                activeOpacity={0.7}
              >
                {numeroCuotas === 1 && (
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.cuotaLabel, numeroCuotas === 1 && styles.cuotaLabelSelected]}>
                  1 Cuota
                </Text>
                <Text style={[styles.cuotaValue, numeroCuotas === 1 && styles.cuotaValueSelected]}>
                  ${Number(montoPorCuota1).toFixed(2)}
                </Text>
                <Text style={[styles.cuotaSubtext, numeroCuotas === 1 && styles.cuotaSubtextSelected]}>
                  Pago único
                </Text>
                {numeroCuotas === 1 && (
                  <View style={styles.checkIcon}>
                    <CheckCircle2 size={18} color="#22c55e" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cuotaCard,
                  numeroCuotas === 2 && styles.cuotaCardSelected,
                ]}
                onPress={() => setNumeroCuotas(2)}
                activeOpacity={0.7}
              >
                {numeroCuotas === 2 && (
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.cuotaLabel, numeroCuotas === 2 && styles.cuotaLabelSelected]}>
                  2 Cuotas
                </Text>
                <Text style={[styles.cuotaValue, numeroCuotas === 2 && styles.cuotaValueSelected]}>
                  ${Number(montoPorCuota2).toFixed(2)}
                </Text>
                <Text style={[styles.cuotaSubtext, numeroCuotas === 2 && styles.cuotaSubtextSelected]}>
                  c/u
                </Text>
                {numeroCuotas === 2 && (
                  <View style={styles.checkIcon}>
                    <CheckCircle2 size={18} color="#22c55e" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cuotaCard,
                  numeroCuotas === 3 && styles.cuotaCardSelected,
                ]}
                onPress={() => setNumeroCuotas(3)}
                activeOpacity={0.7}
              >
                {numeroCuotas === 3 && (
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                <Text style={[styles.cuotaLabel, numeroCuotas === 3 && styles.cuotaLabelSelected]}>
                  3 Cuotas
                </Text>
                <Text style={[styles.cuotaValue, numeroCuotas === 3 && styles.cuotaValueSelected]}>
                  ${Number(montoPorCuota3).toFixed(2)}
                </Text>
                <Text style={[styles.cuotaSubtext, numeroCuotas === 3 && styles.cuotaSubtextSelected]}>
                  ⭐ Recomendado
                </Text>
                {numeroCuotas === 3 && (
                  <View style={styles.checkIcon}>
                    <CheckCircle2 size={18} color="#22c55e" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Resumen de selección */}
            <View style={styles.resumenContainer}>
              <Text style={styles.resumenText}>
                Has seleccionado:{' '}
                <Text style={styles.resumenHighlight}>
                  {numeroCuotas} cuota{numeroCuotas > 1 ? 's' : ''}
                </Text>{' '}
                de{' '}
                <Text style={styles.resumenAmount}>
                  $
                  {numeroCuotas === 1
                    ? montoPorCuota1.toFixed(2)
                    : numeroCuotas === 2
                      ? montoPorCuota2.toFixed(2)
                      : montoPorCuota3.toFixed(2)}
                </Text>{' '}
                cada una
              </Text>
            </View>

            {/* Información de métodos de pago */}
            <View style={styles.paymentInfo}>
              <View style={styles.paymentInfoHeader}>
                <CreditCard size={16} color="#3b82f6" />
                <Text style={styles.paymentInfoTitle}>Métodos de Pago Disponibles</Text>
              </View>
              <Text style={styles.paymentInfoText}>
                • Transferencia Bancaria: Contacta a la administración{'\n'}
                • Mercado Pago: Solicita el link de pago{'\n'}
                • En efectivo: Acércate a tu sede más cercana
              </Text>
              <Text style={styles.paymentInfoNote}>
                💡 Una vez completada tu inscripción, recibirás un email con instrucciones detalladas
                sobre cómo realizar el pago.
              </Text>
            </View>
          </View>
        )}

        {/* Cupo */}
        {convencion.cupoMaximo && (
          <View style={styles.cupoContainer}>
            <Text style={styles.cupoText}>
              Cupos disponibles: <Text style={styles.cupoValue}>{convencion.cupoMaximo}</Text>
            </Text>
          </View>
        )}

        {/* Mensaje si ya está inscrito */}
        {yaInscrito && inscripcionExistente && (
          <View style={styles.yaInscritoContainer}>
            <View style={styles.yaInscritoCard}>
              <Text style={styles.yaInscritoIcon}>✓</Text>
              <Text style={styles.yaInscritoTitle}>Ya estás inscrito</Text>
              <Text style={styles.yaInscritoText}>
                Tu inscripción fue registrada el{' '}
                {format(parseISO(inscripcionExistente.fechaInscripcion), 'dd/MM/yyyy', { locale: es })}
              </Text>
              <Text style={styles.yaInscritoSubtext}>
                Estado: <Text style={styles.estadoText}>{inscripcionExistente.estado}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.continueButton, yaInscrito && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={yaInscrito}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text
                style={[styles.continueButtonText, yaInscrito && styles.continueButtonTextDisabled]}
              >
                {yaInscrito ? '✓ Ya Inscrito' : 'Continuar'}
              </Text>
              {!yaInscrito && <ArrowRight size={16} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  costoContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  costoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  costoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  costoValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fbbf24',
    textAlign: 'center',
  },
  cuotasTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    textAlign: 'center',
  },
  required: {
    color: '#ef4444',
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
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resumenText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  resumenHighlight: {
    fontWeight: '600',
    color: '#4ade80',
  },
  resumenAmount: {
    fontWeight: '700',
    color: '#fff',
  },
  paymentInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  paymentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  paymentInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60a5fa',
  },
  paymentInfoText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 18,
    marginBottom: 8,
  },
  paymentInfoNote: {
    fontSize: 10,
    color: 'rgba(96, 165, 250, 0.8)',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  cupoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cupoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cupoValue: {
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  yaInscritoContainer: {
    marginTop: 20,
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
  yaInscritoIcon: {
    fontSize: 32,
    color: '#22c55e',
    marginBottom: 8,
  },
  yaInscritoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
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
})
