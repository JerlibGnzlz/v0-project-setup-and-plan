import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { CredencialFlipCard } from '../CredencialFlipCard'
import { CredentialsResumen } from './CredentialsResumen'
import { getCredencialTipoLegible } from '@hooks/use-credenciales'
import type { CredencialUnificada } from '@api/credenciales'

interface CredentialsWizardProps {
  currentStep: number
  totalSteps: number
  credencialesList: CredencialUnificada[]
  currentCredencialIndex: number
  resumen: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
  fadeAnim: Animated.Value
  onNext: () => void
  onPrevious: () => void
  onReset: () => void
}

export function CredentialsWizard({
  currentStep,
  totalSteps,
  credencialesList,
  currentCredencialIndex,
  resumen,
  fadeAnim,
  onNext,
  onPrevious,
  onReset,
}: CredentialsWizardProps) {
  return (
    <>
      {/* Información de credenciales disponibles */}
      <View style={styles.credencialesInfoContainer}>
        <Text style={styles.credencialesInfoTitle}>
          {credencialesList.length === 1
            ? '1 Credencial Disponible'
            : `${credencialesList.length} Credenciales Disponibles`}
        </Text>
        <View style={styles.credencialesTypesContainer}>
          {credencialesList.some(c => c.tipo === 'ministerial') && (
            <View style={styles.credencialTypeBadge}>
              <Text style={styles.credencialTypeText}>
                {credencialesList.filter(c => c.tipo === 'ministerial').length}x Ministerial
              </Text>
            </View>
          )}
          {credencialesList.some(c => c.tipo === 'capellania') && (
            <View style={[styles.credencialTypeBadge, styles.credencialTypeBadgeCapellania]}>
              <Text style={styles.credencialTypeText}>
                {credencialesList.filter(c => c.tipo === 'capellania').length}x Capellanía
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const credencialActual = credencialesList[stepNumber - 2]

          return (
            <View key={stepNumber} style={styles.stepRow}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && styles.stepCircleActive,
                    credencialActual?.tipo === 'capellania' && styles.stepCircleCapellania,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      isCompleted && styles.stepNumberCompleted,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={[styles.stepTitle, (isCompleted || isActive) && styles.stepTitleActive]}>
                    {stepNumber === 1 ? 'Resumen' : `Credencial ${stepNumber - 1}`}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {stepNumber === 1
                      ? 'Resumen de credenciales'
                      : getCredencialTipoLegible(credencialActual?.tipo || 'ministerial')}
                  </Text>
                </View>
              </View>
              {index < totalSteps - 1 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
              )}
            </View>
          )
        })}
      </View>

      {/* Wizard Content */}
      <Animated.View style={[styles.wizardContent, { opacity: fadeAnim }]}>
        {currentStep === 1 && <CredentialsResumen resumen={resumen} credencialesList={credencialesList} fadeAnim={fadeAnim} />}

        {currentStep > 1 && currentCredencialIndex < credencialesList.length && (
          <View style={styles.wizardStepContainer}>
            <View style={styles.credentialCardWrapper}>
              <CredencialFlipCard credencial={credencialesList[currentCredencialIndex]} />
            </View>
          </View>
        )}
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
            <ChevronLeft size={20} color="#fff" />
            <Text style={styles.navButtonText}>Anterior</Text>
          </TouchableOpacity>
        )}

        {currentStep < totalSteps && (
          <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={onNext}>
            <Text style={styles.navButtonText}>Siguiente</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {currentStep === totalSteps && (
          <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={onReset}>
            <Text style={styles.navButtonText}>Volver al Inicio</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  credencialesInfoContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  credencialesInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  credencialesTypesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  credencialTypeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  credencialTypeBadgeCapellania: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  credencialTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepRow: {
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepCircleCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  stepCircleCapellania: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  stepNumberCompleted: {
    color: '#fff',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: '#fff',
  },
  stepDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 19,
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#22c55e',
  },
  wizardContent: {
    marginBottom: 24,
  },
  wizardStepContainer: {
    marginBottom: 24,
  },
  credentialCardWrapper: {
    marginBottom: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: '#22c55e',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

