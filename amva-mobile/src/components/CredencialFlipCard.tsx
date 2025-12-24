import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { RotateCcw, CheckCircle, Clock, AlertCircle } from 'lucide-react-native'
import type { CredencialUnificada } from '@api/credenciales'
import { getEstadoColor, getEstadoMensaje } from '@hooks/use-credenciales'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 400)
const CARD_HEIGHT = (CARD_WIDTH * 252) / 400 // Mantener proporción 400:252

interface CredencialFlipCardProps {
  credencial: CredencialUnificada
}

export function CredencialFlipCard({ credencial }: CredencialFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const frontOpacity = React.useRef(new Animated.Value(1)).current
  const backOpacity = React.useRef(new Animated.Value(0)).current
  const frontScale = React.useRef(new Animated.Value(1)).current
  const backScale = React.useRef(new Animated.Value(0.8)).current

  const flipCard = () => {
    const toFlipped = !isFlipped
    setIsFlipped(toFlipped)

    Animated.parallel([
      Animated.timing(frontOpacity, {
        toValue: toFlipped ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backOpacity, {
        toValue: toFlipped ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(frontScale, {
        toValue: toFlipped ? 0.8 : 1,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }),
      Animated.spring(backScale, {
        toValue: toFlipped ? 1 : 0.8,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const frontAnimatedStyle = {
    opacity: frontOpacity,
    transform: [{ scale: frontScale }],
  }

  const backAnimatedStyle = {
    opacity: backOpacity,
    transform: [{ scale: backScale }],
  }

  // Determinar colores según el tipo de credencial
  const getGradientColors = () => {
    switch (credencial.tipo) {
      case 'pastoral':
        return ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af', '#1e3a8a', '#1e40af', '#2563eb']
      case 'ministerial':
        return ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af', '#1e3a8a', '#1e40af', '#2563eb']
      case 'capellania':
        return ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#15803d', '#16a34a']
      default:
        return ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af', '#1e3a8a', '#1e40af', '#2563eb']
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const fechaVencimiento = formatDate(credencial.fechaVencimiento)
  const fechaNacimiento = credencial.fechaNacimiento ? formatDate(credencial.fechaNacimiento) : ''
  const fechaEmision = credencial.fechaEmision ? formatDate(credencial.fechaEmision) : ''

  const gradientColors = getGradientColors()

  // Obtener información del estado
  const estadoColor = credencial.estado !== 'sin_credencial' 
    ? getEstadoColor(credencial.estado as 'vigente' | 'por_vencer' | 'vencida')
    : '#6b7280'
  const estadoMensaje = credencial.estado !== 'sin_credencial'
    ? getEstadoMensaje(credencial.estado as 'vigente' | 'por_vencer' | 'vencida', credencial.diasRestantes)
    : 'Sin estado'
  
  const getEstadoIcon = () => {
    switch (credencial.estado) {
      case 'vigente':
        return CheckCircle
      case 'por_vencer':
        return Clock
      case 'vencida':
        return AlertCircle
      default:
        return Clock
    }
  }
  
  const EstadoIcon = getEstadoIcon()

  return (
    <View style={styles.container}>
      {/* Botón para voltear */}
      <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
        <RotateCcw size={16} color="#fff" />
        <Text style={styles.flipButtonText}>{isFlipped ? 'Ver Frente' : 'Ver Dorso'}</Text>
      </TouchableOpacity>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        {/* FRENTE */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
          ]}
        >
          <LinearGradient colors={gradientColors} style={styles.cardGradient}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>ASOCIACIÓN MISIONERA</Text>
              <Text style={styles.headerTitle}>VIDA ABUNDANTE</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.contentRow}>
                {/* Foto */}
                <View style={styles.photoSection}>
                  <View style={styles.photoContainer}>
                    {credencial.fotoUrl ? (
                      <Image
                        source={{
                          uri: `${credencial.fotoUrl}${credencial.fotoUrl.includes('?') ? '&' : '?'}t=${credencial.id}`,
                        }}
                        style={styles.photo}
                        key={`photo-${credencial.id}-${credencial.fotoUrl}`}
                      />
                    ) : (
                      <Text style={styles.photoPlaceholder}>FOTO</Text>
                    )}
                  </View>
                  <Text style={styles.tipoText}>
                    {credencial.tipo === 'pastoral'
                      ? credencial.tipoPastor || 'PASTOR'
                      : credencial.tipo === 'ministerial'
                        ? credencial.tipoPastor || 'PASTOR'
                        : credencial.tipoCapellan || 'CAPELLAN'}{' '}
                    / {credencial.tipo === 'capellania' ? 'CHAPLAIN' : 'SHEPHERD'}
                  </Text>
                </View>

                {/* Información */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Apellido / Surname</Text>
                    <Text style={styles.infoValue}>{credencial.apellido}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nombre / Name</Text>
                    <Text style={styles.infoValue}>{credencial.nombre}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Documento / Document</Text>
                    <Text style={styles.infoValue}>
                      {credencial.numero || credencial.documento || 'N/A'}
                    </Text>
                  </View>
                  {credencial.nacionalidad && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nacionalidad / Nationality</Text>
                      <Text style={styles.infoValue}>{credencial.nacionalidad}</Text>
                    </View>
                  )}
                  {fechaNacimiento && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Fecha de nacimiento / Birthdate</Text>
                      <Text style={styles.infoValue}>{fechaNacimiento}</Text>
                    </View>
                  )}
                  {/* Estado y días restantes */}
                  {credencial.estado !== 'sin_credencial' && (
                    <View style={styles.estadoContainer}>
                      <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}20` }]}>
                        <EstadoIcon size={10} color={estadoColor} />
                        <Text style={[styles.estadoText, { color: estadoColor }]}>
                          {credencial.estado.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.diasRestantesText}>
                        {credencial.diasRestantes > 0 
                          ? `${credencial.diasRestantes} días restantes`
                          : `Vencida hace ${Math.abs(credencial.diasRestantes)} días`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Logo */}
                <View style={styles.logoSection}>
                  <Image
                    source={
                      credencial.tipo === 'capellania'
                        ? require('../../assets/images/capellania.png')
                        : require('../../assets/images/mundo.png')
                    }
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>
                {credencial.tipo === 'pastoral'
                  ? 'CREDENCIAL PASTORAL'
                  : credencial.tipo === 'ministerial'
                    ? 'CREDENCIAL MINISTERIAL INTERNACIONAL'
                    : 'CHAPLAIN MINISTERS INTERNATIONAL'}
              </Text>
              <Text style={styles.footerAddress}>
                SEDE SOCIAL: PICO 1641 (1429) CAPITAL FEDERAL
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* DORSO */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
          ]}
        >
          <LinearGradient colors={gradientColors} style={styles.cardGradient}>
            <View style={styles.dorsoContent}>
              {/* Header con Logo y Texto */}
              <View style={styles.dorsoHeader}>
                <Image
                  source={require('../../assets/images/mundo.png')}
                  style={styles.dorsoLogo}
                  resizeMode="contain"
                />
                <View style={styles.dorsoHeaderText}>
                  <Text style={styles.dorsoTitle}>EL CONSEJO EJECUTIVO NACIONAL</Text>
                  <Text style={styles.dorsoCertificacion}>
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </Text>
                </View>
              </View>

              {/* FICHERO DE CULTO */}
              <View style={styles.ficheroContainer}>
                <Text style={styles.ficheroText}>
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA{' '}
                  {credencial.tipo === 'capellania' ? '000-113' : '000-318'} C.U.I.T.30-68748687-7
                </Text>
              </View>

              {/* Footer: Firma y QR + Fecha */}
              <View style={styles.dorsoFooter}>
                {/* Firma - Izquierda */}
                <View style={styles.firmaContainer}>
                  <View style={styles.firmaBox}>
                    <Image
                      source={require('../../assets/images/firma-presidente.png')}
                      style={styles.firmaImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.firmaText}>FIRMA PRESIDENTE DEL C.E.N.</Text>
                </View>

                {/* QR + Fecha - Derecha */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrBox}>
                    <Image
                      source={require('../../assets/images/qr.png')}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.venceText}>VENCE: {fechaVencimiento}</Text>
                  {/* Estado y días restantes en el dorso */}
                  {credencial.estado !== 'sin_credencial' && (
                    <View style={styles.dorsoEstadoContainer}>
                      <View style={[styles.dorsoEstadoBadge, { backgroundColor: `${estadoColor}20` }]}>
                        <EstadoIcon size={8} color={estadoColor} />
                        <Text style={[styles.dorsoEstadoText, { color: estadoColor }]}>
                          {credencial.estado.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.dorsoDiasText}>
                        {credencial.diasRestantes > 0 
                          ? `${credencial.diasRestantes} días`
                          : `${Math.abs(credencial.diasRestantes)} días vencida`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardFront: {
    backgroundColor: 'transparent',
  },
  cardBack: {
    backgroundColor: 'transparent',
  },
  cardGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoSection: {
    width: 88,
    alignItems: 'center',
  },
  photoContainer: {
    width: 88,
    height: 108,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 4,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tipoText: {
    fontSize: 7,
    textAlign: 'center',
    fontWeight: '600',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoSection: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  infoRow: {
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 7,
    color: '#0D374E',
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    lineHeight: 12,
  },
  logoSection: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  footerAddress: {
    fontSize: 7,
    color: '#0D374E',
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  // Estilos para el dorso
  dorsoContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dorsoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  dorsoLogo: {
    width: 70,
    height: 70,
  },
  dorsoHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  dorsoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 3,
    lineHeight: 13,
  },
  dorsoCertificacion: {
    fontSize: 8,
    lineHeight: 10,
    color: '#0D374E',
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ficheroContainer: {
    marginBottom: 6,
    marginTop: 4,
  },
  ficheroText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0D374E',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 8,
  },
  dorsoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 'auto',
    paddingTop: 4,
  },
  firmaContainer: {
    width: 155,
    alignItems: 'center',
  },
  firmaBox: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  firmaImage: {
    width: '100%',
    height: '100%',
    tintColor: '#000',
    opacity: 0.3,
  },
  firmaText: {
    fontSize: 7,
    fontWeight: '600',
    color: '#0D374E',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 8,
  },
  qrContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  qrBox: {
    width: 72,
    height: 72,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  venceText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0D374E',
    textAlign: 'right',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 8,
  },
  estadoContainer: {
    marginTop: 4,
    gap: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  estadoText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  diasRestantesText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dorsoEstadoContainer: {
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  dorsoEstadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  dorsoEstadoText: {
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dorsoDiasText: {
    fontSize: 6,
    fontWeight: '600',
    color: '#0D374E',
    textAlign: 'right',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})

