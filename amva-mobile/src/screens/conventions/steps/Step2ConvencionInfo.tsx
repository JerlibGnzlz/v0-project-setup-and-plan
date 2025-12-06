import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { type Convencion } from '@api/convenciones'

interface Step2ConvencionInfoProps {
  convencion: Convencion
  yaInscrito?: boolean
  inscripcionExistente?: any
  onComplete: () => void
  onBack: () => void
}

export function Step2ConvencionInfo({
  convencion,
  yaInscrito = false,
  inscripcionExistente,
  onComplete,
  onBack,
}: Step2ConvencionInfoProps) {
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

  // Asegurar que sean números válidos
  const montoPorCuota1 = Number(costo) || 0
  const montoPorCuota2 = Number(costo / 2) || 0
  const montoPorCuota3 = Number(costo / 3) || 0

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

        {/* Costo y Cuotas */}
        {costo > 0 && (
          <View style={styles.costoContainer}>
            <Text style={styles.costoLabel}>Costo Total</Text>
            <Text style={styles.costoValue}>${Number(costo).toFixed(2)}</Text>

            <View style={styles.cuotasContainer}>
              <View style={styles.cuotaCard}>
                <Text style={styles.cuotaLabel}>1 Cuota</Text>
                <Text style={styles.cuotaValue}>${Number(montoPorCuota1).toFixed(2)}</Text>
              </View>
              <View style={styles.cuotaCard}>
                <Text style={styles.cuotaLabel}>2 Cuotas</Text>
                <Text style={styles.cuotaValue}>${Number(montoPorCuota2).toFixed(2)}</Text>
              </View>
              <View style={[styles.cuotaCard, styles.cuotaCardHighlighted]}>
                <Text style={[styles.cuotaLabel, styles.cuotaLabelHighlighted]}>3 Cuotas</Text>
                <Text style={[styles.cuotaValue, styles.cuotaValueHighlighted]}>
                  ${Number(montoPorCuota3).toFixed(2)}
                </Text>
              </View>
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

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, yaInscrito && styles.continueButtonDisabled]}
            onPress={onComplete}
            disabled={yaInscrito}
          >
            <Text
              style={[styles.continueButtonText, yaInscrito && styles.continueButtonTextDisabled]}
            >
              {yaInscrito ? '✓ Ya Inscrito' : '✓ Continuar'}
            </Text>
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
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  costoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  costoValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 16,
  },
  cuotasContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cuotaCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cuotaCardHighlighted: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  cuotaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  cuotaLabelHighlighted: {
    color: '#22c55e',
  },
  cuotaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cuotaValueHighlighted: {
    color: '#22c55e',
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
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    opacity: 0.6,
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
