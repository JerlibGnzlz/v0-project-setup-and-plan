import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
  Modal,
  ScrollView,
  PanResponder,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { RotateCcw, CheckCircle, Clock, AlertCircle, X, ZoomIn } from 'lucide-react-native'
import type { CredencialUnificada } from '@api/credenciales'
import { getEstadoColor, getEstadoMensaje } from '@hooks/use-credenciales'

const CARD_ASPECT = 400 / 252

/** Margen para botones "Ver Dorso" y "Ver Completa" + márgenes del contenedor en landscape */
const LANDSCAPE_BUTTON_STRIP = 110
const LANDSCAPE_SIDE_MARGIN = 16
const PORTRAIT_PADDING = 40
const PORTRAIT_MAX_CARD_WIDTH = 400

/**
 * Dimensiones de la credencial según orientación.
 * useWindowDimensions() actualiza width/height al girar (portrait ↔ landscape).
 * En landscape la credencial ocupa el tamaño de la pantalla (menos una tira para botones).
 */
function getCardDimensions(width: number, height: number) {
  const isLandscape = width > height
  let cardWidth: number
  let cardHeight: number
  if (isLandscape) {
    const availableW = width - LANDSCAPE_SIDE_MARGIN * 2
    const availableH = height - LANDSCAPE_BUTTON_STRIP
    const wByHeight = availableH * CARD_ASPECT
    if (wByHeight <= availableW) {
      cardHeight = availableH
      cardWidth = wByHeight
    } else {
      cardWidth = availableW
      cardHeight = availableW / CARD_ASPECT
    }
  } else {
    cardWidth = Math.min(width - PORTRAIT_PADDING, PORTRAIT_MAX_CARD_WIDTH)
    cardHeight = cardWidth / CARD_ASPECT
  }
  return { cardWidth, cardHeight, isLandscape }
}

/**
 * Dimensiones de la credencial en "Ver completa": cabe en el alto visible
 * (header + padding del ScrollView) para que se vea toda sin cortar.
 */
function getFullScreenCardDimensions(width: number, height: number) {
  const marginW = 16
  const headerHeight = 72
  const scrollPaddingVertical = 40
  const maxW = width - marginW * 2
  const maxH = Math.max(height - headerHeight - scrollPaddingVertical, 220)
  const hByWidth = maxW / CARD_ASPECT
  if (hByWidth <= maxH) {
    return { width: maxW, height: hByWidth }
  }
  return { width: maxH * CARD_ASPECT, height: maxH }
}

/**
 * Dorso en Ver completa: altura suficiente para firma, "DEL C.E.N.", VIGENTE y "X días" sin recortes.
 */
function getFullScreenDorsoCardDimensions(width: number, height: number) {
  const marginW = 16
  const headerHeight = 72
  const scrollPaddingVertical = 0
  const maxW = width - marginW * 2
  const maxH = Math.max(height - headerHeight - scrollPaddingVertical, 360)
  const hByWidth = maxW / CARD_ASPECT
  if (hByWidth <= maxH) {
    return { width: maxW, height: hByWidth }
  }
  return { width: maxH * CARD_ASPECT, height: maxH }
}

// Mismo mapeo que en AMVA Digital: Pastor, Pastora, Reverendo, Reverenda, Obispo, Obispa (todos visibles en la card)
const TIPO_PASTOR_LABEL: Record<string, string> = {
  PASTOR: 'PASTOR / PASTOR',
  PASTORA: 'PASTORA / PASTOR',
  REVERENDO: 'REVERENDO / REVEREND',
  REVERENDA: 'REVERENDA / REVEREND',
  OBISPO: 'OBISPO / BISHOP',
  OBISPA: 'OBISPA / BISHOP',
}

function getTipoPastorDisplay(tipoPastor: string | undefined, tipo: string): string {
  if (tipo === 'capellania') return 'CAPELLÁN / CHAPLAIN'
  const raw = (tipoPastor?.trim() || 'PASTOR').toUpperCase()
  // Si viene etiqueta completa (ej. "Obispo / Bishop"), extraer clave y mostrar etiqueta canónica
  if (raw.includes(' / ')) {
    const key = raw.split(' / ')[0]?.trim() || 'PASTOR'
    return TIPO_PASTOR_LABEL[key] ?? raw
  }
  return TIPO_PASTOR_LABEL[raw] ?? raw
}

interface CredencialFlipCardProps {
  credencial: CredencialUnificada
}

function safeFormatDate(value: string | Date | null | undefined): string {
  if (value == null) return ''
  try {
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function CredencialFlipCard({ credencial }: CredencialFlipCardProps) {
  const { width: winWidth, height: winHeight } = useWindowDimensions()
  const { cardWidth, cardHeight } = useMemo(
    () => getCardDimensions(winWidth, winHeight),
    [winWidth, winHeight]
  )
  const fullScreenDims = useMemo(
    () => getFullScreenCardDimensions(winWidth, winHeight),
    [winWidth, winHeight]
  )
  const fullScreenDorsoDims = useMemo(
    () => getFullScreenDorsoCardDimensions(winWidth, winHeight),
    [winWidth, winHeight]
  )
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [fullScreenFlipped, setFullScreenFlipped] = useState(false)
  const [showQrZoom, setShowQrZoom] = useState(false)
  const frontOpacity = React.useRef(new Animated.Value(1)).current
  const backOpacity = React.useRef(new Animated.Value(0)).current
  const frontScale = React.useRef(new Animated.Value(1)).current
  const backScale = React.useRef(new Animated.Value(0.8)).current

  if (!credencial || !credencial.id) {
    return (
      <View style={[styles.container, { padding: 20, alignItems: 'center' }]}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          No se pudo cargar la credencial.
        </Text>
      </View>
    )
  }

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

  // Gradiente único para frente y dorso (celeste/azul o verde según tipo)
  const getDorsoGradientColors = () => {
    switch (credencial.tipo) {
      case 'pastoral':
      case 'ministerial':
        return ['#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#0284c7', '#0ea5e9']
      case 'capellania':
        return ['#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#16a34a', '#22c55e']
      default:
        return ['#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#0284c7', '#0ea5e9']
    }
  }

  const fechaVencimiento = safeFormatDate(credencial.fechaVencimiento)
  const fechaNacimiento = safeFormatDate(credencial.fechaNacimiento)
  const fechaEmision = safeFormatDate(credencial.fechaEmision)

  const dorsoGradientColors = getDorsoGradientColors()

  // Obtener información del estado
  const estadoColor = credencial.estado !== 'sin_credencial' 
    ? getEstadoColor(credencial.estado as 'vigente' | 'por_vencer' | 'vencida')
    : '#6b7280'
  // Color más oscuro para el texto del badge en dorso Ver completa (mejor contraste)
  const dorsoBadgeTextColor =
    credencial.estado === 'vigente'
      ? '#14532d'
      : credencial.estado === 'por_vencer'
        ? '#9a3412'
        : credencial.estado === 'vencida'
          ? '#991b1b'
          : estadoColor
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

  const openFullScreen = () => {
    setFullScreenFlipped(isFlipped)
    setIsFullScreen(true)
  }

  const closeFullScreen = () => {
    setIsFullScreen(false)
  }

  const flipFullScreen = () => {
    setFullScreenFlipped(!fullScreenFlipped)
  }

  return (
    <View style={styles.container}>
      {/* Botón para voltear */}
      <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
        <RotateCcw size={16} color="#fff" />
        <Text style={styles.flipButtonText}>{isFlipped ? 'Ver Frente' : 'Ver Dorso'}</Text>
      </TouchableOpacity>

      {/* Botón para pantalla completa */}
      <TouchableOpacity style={styles.fullScreenButton} onPress={openFullScreen}>
        <ZoomIn size={16} color="#fff" />
        <Text style={styles.fullScreenButtonText}>Ver Completa</Text>
      </TouchableOpacity>

      {/* Card Container - Tocable para abrir pantalla completa */}
      <TouchableOpacity
        style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}
        onPress={openFullScreen}
        activeOpacity={0.9}
      >
        {/* FRENTE */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            { width: cardWidth, height: cardHeight },
          ]}
        >
          <LinearGradient colors={dorsoGradientColors} style={styles.cardGradient}>
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
                  <View style={styles.tipoTextWrapper}>
                    <Text style={styles.tipoText} numberOfLines={2}>
                      {credencial.tipo === 'pastoral'
                        ? getTipoPastorDisplay(credencial.tipoPastor, 'pastoral')
                        : credencial.tipo === 'ministerial'
                          ? getTipoPastorDisplay(credencial.tipoPastor, 'ministerial')
                          : getTipoPastorDisplay(undefined, 'capellania')}
                    </Text>
                  </View>
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
            { width: cardWidth, height: cardHeight },
          ]}
        >
          <LinearGradient colors={dorsoGradientColors} style={[styles.cardGradient, styles.cardGradientDorsoFullScreen]}>
            <View style={[styles.dorsoContent, styles.dorsoContentFullScreen]}>
              {/* Header con Logo y Texto (mismo layout que Ver completa) */}
              <View style={[styles.dorsoHeader, styles.dorsoHeaderFullScreen]}>
                <Image
                  source={require('../../assets/images/mundo.png')}
                  style={[styles.dorsoLogo, styles.dorsoLogoFullScreen]}
                  resizeMode="contain"
                />
                <View style={styles.dorsoHeaderText}>
                  <Text style={[styles.dorsoTitle, styles.dorsoTitleFullScreen]}>EL CONSEJO EJECUTIVO NACIONAL</Text>
                  <Text style={[styles.dorsoCertificacion, styles.dorsoCertificacionFullScreen]}>
                    CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                    MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                  </Text>
                </View>
              </View>

              {/* FICHERO DE CULTO */}
              <View style={[styles.ficheroContainer, styles.ficheroContainerFullScreen]}>
                <Text style={[styles.ficheroText, styles.ficheroTextFullScreen]}>
                  FICHERO de CULTO N 2753 PERSO.-JURIDICA{' '}
                  {credencial.tipo === 'capellania' ? '000-113' : '000-318'} C.U.I.T.30-68748687-7
                </Text>
              </View>

              {/* Footer: Firma y QR + Fecha (mismo layout que Ver completa) */}
              <View style={[styles.dorsoFooter, styles.dorsoFooterFullScreen]}>
                <View style={[styles.firmaContainer, styles.firmaContainerFullScreen]}>
                  <View style={[styles.firmaBox, styles.firmaBoxFullScreen]}>
                    <Image
                      source={require('../../assets/images/firma-presidente.png')}
                      style={[styles.firmaImage, styles.firmaImageFullScreen]}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.firmaText, styles.firmaTextFullScreen]}>FIRMA PRESIDENTE DEL C.E.N.</Text>
                </View>

                <View style={[styles.qrContainer, styles.qrContainerFullScreen]}>
                  <TouchableOpacity
                    style={[styles.qrBox, styles.qrBoxFullScreen]}
                    onPress={() => setShowQrZoom(true)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={require('../../assets/images/qr.png')}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Text style={styles.venceText}>VENCE: {fechaVencimiento}</Text>
                  {credencial.estado !== 'sin_credencial' && (
                    <View style={styles.dorsoEstadoContainer}>
                      <View style={[styles.dorsoEstadoBadge, { backgroundColor: `${estadoColor}45` }]}>
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
      </TouchableOpacity>

      {/* Modal de Pantalla Completa con Zoom */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
        statusBarTranslucent={true}
      >
        <View style={styles.fullScreenContainer}>
          {/* Header con controles */}
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity style={styles.fullScreenControlButton} onPress={flipFullScreen}>
              <RotateCcw size={24} color="#fff" />
              <Text style={styles.fullScreenControlText}>
                {fullScreenFlipped ? 'Ver Frente' : 'Ver Dorso'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fullScreenCloseButton} onPress={closeFullScreen}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Contenedor scrolleable con zoom */}
          <ScrollView
            style={styles.fullScreenScrollView}
            contentContainerStyle={styles.fullScreenScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            bouncesZoom={true}
            scrollEnabled={true}
            pinchGestureEnabled={true}
          >
            {!fullScreenFlipped ? (
              /* FRENTE en pantalla completa */
              <View style={[styles.fullScreenCard, { width: fullScreenDims.width, height: fullScreenDims.height }]}>
                <LinearGradient colors={dorsoGradientColors} style={styles.cardGradient}>
                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>ASOCIACIÓN MISIONERA</Text>
                    <Text style={styles.headerTitle}>VIDA ABUNDANTE</Text>
                  </View>

                  <View style={styles.content}>
                    <View style={styles.contentRow}>
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
                        <View style={styles.tipoTextWrapper}>
                            <Text style={styles.tipoText}>
                              {credencial.tipo === 'pastoral'
                                ? getTipoPastorDisplay(credencial.tipoPastor, 'pastoral')
                                : credencial.tipo === 'ministerial'
                                  ? getTipoPastorDisplay(credencial.tipoPastor, 'ministerial')
                                  : getTipoPastorDisplay(undefined, 'capellania')}
                            </Text>
                        </View>
                      </View>

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
                        {/* Estado y días restantes - MEJORADO */}
                        {credencial.estado !== 'sin_credencial' && (
                          <View style={styles.estadoContainer}>
                            <View style={[styles.estadoBadgeLarge, { backgroundColor: `${estadoColor}30` }]}>
                              <EstadoIcon size={16} color={estadoColor} />
                              <Text style={[styles.estadoTextLarge, { color: estadoColor }]}>
                                {credencial.estado.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.diasRestantesTextLarge}>
                              {credencial.diasRestantes > 0 
                                ? `${credencial.diasRestantes} días restantes`
                                : `Vencida hace ${Math.abs(credencial.diasRestantes)} días`}
                            </Text>
                          </View>
                        )}
                      </View>

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
              </View>
            ) : (
              /* DORSO en pantalla completa: más altura para que se vea toda la info (firma, QR, VENCE, VIGENTE, días) */
              <View style={[styles.fullScreenCard, { width: fullScreenDorsoDims.width, height: fullScreenDorsoDims.height }]}>
                <LinearGradient colors={dorsoGradientColors} style={[styles.cardGradient, styles.cardGradientDorsoFullScreen]}>
                  <View style={[styles.dorsoContent, styles.dorsoContentFullScreen]}>
                    <View style={[styles.dorsoHeader, styles.dorsoHeaderFullScreen]}>
                      <Image
                        source={require('../../assets/images/mundo.png')}
                        style={[styles.dorsoLogo, styles.dorsoLogoFullScreen]}
                        resizeMode="contain"
                      />
                      <View style={styles.dorsoHeaderText}>
                        <Text style={[styles.dorsoTitle, styles.dorsoTitleFullScreen]}>EL CONSEJO EJECUTIVO NACIONAL</Text>
                        <Text style={[styles.dorsoCertificacion, styles.dorsoCertificacionFullScreen]}>
                          CERTIFICA QUE EL PORTADOR ESTÁ AUTORIZADO PARA EJERCER LOS CARGOS
                          MINISTERIALES Y ADMINISTRATIVOS QUE CORRESPONDAN
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.ficheroContainer, styles.ficheroContainerFullScreen]}>
                      <Text style={[styles.ficheroText, styles.ficheroTextFullScreen]}>
                        FICHERO de CULTO N 2753 PERSO.-JURIDICA{' '}
                        {credencial.tipo === 'capellania' ? '000-113' : '000-318'} C.U.I.T.30-68748687-7
                      </Text>
                    </View>

                    <View style={[styles.dorsoFooter, styles.dorsoFooterFullScreen]}>
                      <View style={[styles.firmaContainer, styles.firmaContainerFullScreen]}>
                        <View style={[styles.firmaBox, styles.firmaBoxFullScreen]}>
                          <Image
                            source={require('../../assets/images/firma-presidente.png')}
                            style={[styles.firmaImage, styles.firmaImageFullScreen]}
                            resizeMode="contain"
                          />
                        </View>
                        <Text style={[styles.firmaText, styles.firmaTextFullScreen]}>FIRMA PRESIDENTE DEL C.E.N.</Text>
                      </View>

                      <View style={[styles.qrContainer, styles.qrContainerFullScreen]}>
                        <TouchableOpacity
                          style={[styles.qrBox, styles.qrBoxFullScreen]}
                          onPress={() => setShowQrZoom(true)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={require('../../assets/images/qr.png')}
                            style={styles.qrImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        {/* Fecha de vencimiento MEJORADA */}
                        <Text style={styles.venceTextLarge}>VENCE: {fechaVencimiento}</Text>
                        {/* Estado y días restantes en el dorso - MEJORADO */}
                        {credencial.estado !== 'sin_credencial' && (
                          <View style={[styles.dorsoEstadoContainer, styles.dorsoEstadoContainerFullScreen]}>
                            <View style={[styles.dorsoEstadoBadgeLarge, { backgroundColor: `${estadoColor}55` }]}>
                              <EstadoIcon size={12} color={dorsoBadgeTextColor} />
                              <Text style={[styles.dorsoEstadoTextLarge, { color: dorsoBadgeTextColor }]}>
                                {credencial.estado.toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.dorsoDiasTextLarge}>
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
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal QR ampliado para escanear */}
      <Modal
        visible={showQrZoom}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrZoom(false)}
      >
        <TouchableOpacity
          style={styles.qrZoomOverlay}
          activeOpacity={1}
          onPress={() => setShowQrZoom(false)}
        >
          <TouchableOpacity
            style={styles.qrZoomCard}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Image
              source={require('../../assets/images/qr.png')}
              style={styles.qrZoomImage}
              resizeMode="contain"
            />
            <Text style={styles.qrZoomHint}>Toque fuera para cerrar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    minWidth: 200,
    minHeight: 126,
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
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
    color: '#374151',
    fontWeight: '800',
    textAlign: 'center',
  },
  tipoText: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '800',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    width: '100%',
    paddingHorizontal: 2,
    lineHeight: 14,
  },
  tipoTextWrapper: {
    width: '100%',
    alignItems: 'center',
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
    color: '#000',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    lineHeight: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginBottom: 2,
    textAlign: 'center',
  },
  footerAddress: {
    fontSize: 7,
    color: '#000',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
  },
  // Estilos para el dorso
  dorsoContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 10,
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
    fontWeight: '800',
    color: '#0D374E',
    marginBottom: 3,
    lineHeight: 13,
  },
  dorsoCertificacion: {
    fontSize: 8,
    lineHeight: 10,
    color: '#0D374E',
    fontWeight: '700',
  },
  ficheroContainer: {
    marginBottom: 6,
    marginTop: 4,
  },
  ficheroText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#0D374E',
    textAlign: 'center',
    lineHeight: 8,
  },
  dorsoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    marginTop: 'auto',
    paddingTop: 4,
    paddingBottom: 14,
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  dorsoFooterFullScreen: {
    marginTop: 2,
    paddingBottom: 24,
    paddingHorizontal: 12,
    gap: 10,
    flexShrink: 0,
    minHeight: 92,
  },
  cardGradientDorsoFullScreen: {
    paddingBottom: 22,
    paddingTop: 6,
  },
  dorsoContentFullScreen: {
    paddingBottom: 4,
  },
  dorsoHeaderFullScreen: {
    marginBottom: 4,
  },
  dorsoLogoFullScreen: {
    width: 48,
    height: 48,
  },
  dorsoTitleFullScreen: {
    fontSize: 13,
    lineHeight: 15,
    marginBottom: 3,
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dorsoCertificacionFullScreen: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  ficheroContainerFullScreen: {
    marginBottom: 4,
    marginTop: 2,
  },
  ficheroTextFullScreen: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  firmaContainerFullScreen: {
    width: 100,
    maxWidth: '42%',
    flexShrink: 0,
    alignItems: 'center',
  },
  firmaBoxFullScreen: {
    height: 30,
    marginBottom: 4,
    width: '100%',
  },
  firmaImageFullScreen: {
    tintColor: '#000',
    opacity: 1,
  },
  firmaTextFullScreen: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qrContainerFullScreen: {
    gap: 4,
    flexShrink: 0,
    maxWidth: '48%',
    alignItems: 'flex-end',
  },
  qrBoxFullScreen: {
    width: 56,
    height: 56,
  },
  firmaContainer: {
    width: 155,
    maxWidth: '45%',
    alignItems: 'center',
    flexShrink: 0,
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
    tintColor: '#0f172a',
    opacity: 1,
  },
  firmaText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 8,
  },
  qrContainer: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '48%',
    flexShrink: 0,
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
    fontSize: 9,
    fontWeight: '800',
    color: '#0D374E',
    textAlign: 'right',
    lineHeight: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  venceTextLarge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    textAlign: 'right',
    lineHeight: 16,
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  estadoContainer: {
    marginTop: 4,
    gap: 2,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  estadoText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  diasRestantesText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  estadoBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  estadoTextLarge: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  diasRestantesTextLarge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D374E',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 4,
  },
  dorsoEstadoContainer: {
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  dorsoEstadoContainerFullScreen: {
    marginTop: 2,
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
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dorsoDiasText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'right',
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  dorsoEstadoBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dorsoEstadoTextLarge: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dorsoDiasTextLarge: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    textAlign: 'right',
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // Estilos para pantalla completa
  fullScreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  fullScreenButtonText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullScreenControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  fullScreenControlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenCloseButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  fullScreenScrollView: {
    flex: 1,
  },
  fullScreenScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
  },
  qrZoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrZoomCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  qrZoomImage: {
    width: 260,
    height: 260,
  },
  qrZoomHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748b',
  },
})

