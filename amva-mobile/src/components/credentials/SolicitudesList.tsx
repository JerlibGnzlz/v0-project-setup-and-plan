import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { FileText, Plus } from 'lucide-react-native'
import { TipoCredencial } from '@api/solicitudes-credenciales'
import type { SolicitudCredencial, EstadoSolicitud } from '@api/solicitudes-credenciales'

interface SolicitudesListProps {
  solicitudes: SolicitudCredencial[]
  onSolicitarPress: () => void
  getEstadoSolicitudColor: (estado: EstadoSolicitud) => string
  getEstadoSolicitudLabel: (estado: EstadoSolicitud) => string
  formatDate: (dateString: string) => string
}

export function SolicitudesList({
  solicitudes,
  onSolicitarPress,
  getEstadoSolicitudColor,
  getEstadoSolicitudLabel,
  formatDate,
}: SolicitudesListProps) {
  if (solicitudes.length === 0) return null

  return (
    <View style={styles.solicitudesContainer}>
      <Text style={styles.solicitudesTitle}>Mis Solicitudes</Text>
      {solicitudes.map(solicitud => {
        const estadoColor = getEstadoSolicitudColor(solicitud.estado)
        return (
          <View key={solicitud.id} style={styles.solicitudCard}>
            <LinearGradient
              colors={[`${estadoColor}15`, 'rgba(15, 23, 42, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <FileText size={20} color={estadoColor} />
                  <Text style={styles.cardTitle}>
                    Credencial{' '}
                    {solicitud.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'}
                  </Text>
                </View>
                <View style={[styles.badgeContainer, { backgroundColor: `${estadoColor}20` }]}>
                  <Text style={[styles.badgeText, { color: estadoColor }]}>
                    {getEstadoSolicitudLabel(solicitud.estado)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DNI:</Text>
                  <Text style={styles.infoValue}>{solicitud.dni}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombre:</Text>
                  <Text style={styles.infoValue}>
                    {solicitud.nombre} {solicitud.apellido}
                  </Text>
                </View>
                {solicitud.motivo && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Motivo:</Text>
                    <Text style={styles.infoValue}>{solicitud.motivo}</Text>
                  </View>
                )}
                {solicitud.observaciones && (
                  <View style={styles.observacionesContainer}>
                    <Text style={styles.observacionesLabel}>Observaciones:</Text>
                    <Text style={styles.observacionesText}>{solicitud.observaciones}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fecha de solicitud:</Text>
                  <Text style={styles.infoValue}>{formatDate(solicitud.createdAt)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )
      })}
      <TouchableOpacity
        style={styles.solicitarButton}
        onPress={() => {
          console.log('🔍 SolicitudesList: Botón "Nueva Solicitud" presionado')
          onSolicitarPress()
        }}
        activeOpacity={0.7}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.solicitarButtonText}>Nueva Solicitud</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  solicitudesContainer: {
    marginTop: 32,
  },
  solicitudesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  solicitudCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  observacionesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  observacionesLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
  solicitarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

