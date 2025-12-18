import React, { useRef } from 'react'
import { StatusBar } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@hooks/useAuth'
import { InvitadoAuthProvider } from '@hooks/useInvitadoAuth'
import { AppNavigator } from '@navigation/AppNavigator'
import { useNotifications } from '@hooks/useNotifications'
import { AlertProvider, type AlertRef } from '@components/ui/AlertProvider'
import { setGlobalAlertRef } from '@utils/alert'

const queryClient = new QueryClient()

function AppContent() {
  const alertRef = useRef<AlertRef>(null)
  
  // Configurar el alert global
  React.useEffect(() => {
    setGlobalAlertRef(alertRef)
  }, [])

  // Inicializar notificaciones (el hook maneja errores internamente)
  useNotifications()
  return (
    <>
      <AppNavigator />
      <AlertProvider ref={alertRef} />
    </>
  )
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
