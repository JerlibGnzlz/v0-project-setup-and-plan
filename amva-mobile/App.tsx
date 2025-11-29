import React from 'react'
import { StatusBar } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@hooks/useAuth'
import { AppNavigator } from '@navigation/AppNavigator'
import { useNotifications } from '@hooks/useNotifications'

const queryClient = new QueryClient()

function AppContent() {
  try {
    useNotifications() // Inicializar notificaciones
  } catch (error) {
    console.error('❌ Error inicializando notificaciones:', error)
    // Continuar sin notificaciones si hay error
  }
  return <AppNavigator />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}


