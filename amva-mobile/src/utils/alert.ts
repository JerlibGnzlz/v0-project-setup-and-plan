import type { AlertRef } from '../components/ui/AlertProvider'
import type { RefObject } from 'react'

let globalAlertRef: RefObject<AlertRef> | null = null

export function setGlobalAlertRef(ref: RefObject<AlertRef>) {
  globalAlertRef = ref
}

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>,
    type?: 'success' | 'error' | 'warning' | 'info' | 'confirm',
  ) => {
    if (globalAlertRef?.current) {
      globalAlertRef.current.show({
        title,
        message,
        buttons: buttons || [{ text: 'OK' }],
        type: type || 'info',
      })
    } else {
      // Fallback al Alert nativo si no está configurado
      const { Alert: NativeAlert } = require('react-native')
      NativeAlert.alert(title, message, buttons)
    }
  },
}

