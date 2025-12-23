/**
 * Componente de ejemplo para mostrar credenciales usando el hook unificado
 * Este es un ejemplo - puedes adaptarlo a tu diseño
 */

import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useMisCredenciales, getEstadoColor, getEstadoMensaje, getCredencialTipoLegible, getCredencialIdentificador } from '../hooks/use-credenciales'

export function CredencialesList() {
  const { data, isLoading, error } = useMisCredenciales()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Cargando credenciales...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error al cargar credenciales</Text>
        <Text style={styles.errorDetail}>
          {error instanceof Error ? error.message : 'Error desconocido'}
        </Text>
      </View>
    )
  }

  if (!data?.tieneCredenciales) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{data?.mensaje || 'No tienes credenciales'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Resumen */}
      {data.resumen && (
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>Resumen</Text>
          <View style={styles.resumenRow}>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenNumber}>{data.resumen.total}</Text>
              <Text style={styles.resumenLabel}>Total</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenNumber, { color: '#22c55e' }]}>
                {data.resumen.vigentes}
              </Text>
              <Text style={styles.resumenLabel}>Vigentes</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenNumber, { color: '#f59e0b' }]}>
                {data.resumen.porVencer}
              </Text>
              <Text style={styles.resumenLabel}>Por Vencer</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={[styles.resumenNumber, { color: '#ef4444' }]}>
                {data.resumen.vencidas}
              </Text>
              <Text style={styles.resumenLabel}>Vencidas</Text>
            </View>
          </View>
        </View>
      )}

      {/* Lista de credenciales */}
      {data.credenciales.map((credencial) => (
        <View key={credencial.id} style={styles.credencialCard}>
          <View style={styles.credencialHeader}>
            <Text style={styles.credencialTipo}>
              {getCredencialTipoLegible(credencial.tipo)}
            </Text>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: getEstadoColor(credencial.estado) },
              ]}
            >
              <Text style={styles.estadoText}>{credencial.estado.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.credencialNombre}>
            {credencial.nombre} {credencial.apellido}
          </Text>

          <Text style={styles.credencialIdentificador}>
            {credencial.tipo === 'pastoral' ? 'Número' : 'Documento'}:{' '}
            {getCredencialIdentificador(credencial)}
          </Text>

          <Text style={styles.credencialEstado}>
            {getEstadoMensaje(credencial.estado, credencial.diasRestantes)}
          </Text>

          <Text style={styles.credencialVencimiento}>
            Vence: {new Date(credencial.fechaVencimiento).toLocaleDateString('es-ES')}
          </Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  resumenCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  resumenLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  credencialCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  credencialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  credencialTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  credencialNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  credencialIdentificador: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  credencialEstado: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  credencialVencimiento: {
    fontSize: 12,
    color: '#9ca3af',
  },
})

