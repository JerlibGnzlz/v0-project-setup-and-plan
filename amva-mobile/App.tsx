import React from 'react'
import { StatusBar } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@hooks/useAuth'
import { InvitadoAuthProvider } from '@hooks/useInvitadoAuth'
import { AppNavigator } from '@navigation/AppNavigator'
import { useNotifications } from '@hooks/useNotifications'

const queryClient = new QueryClient()

function AppContent() {
  // Inicializar notificaciones (el hook maneja errores internamente)
  useNotifications()
  return <AppNavigator />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InvitadoAuthProvider>
          <StatusBar barStyle="light-content" />
          <AppContent />
        </InvitadoAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
