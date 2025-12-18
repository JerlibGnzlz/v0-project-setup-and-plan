import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { CustomAlert, type AlertType, type AlertButton } from './CustomAlert'

interface AlertState {
  visible: boolean
  type?: AlertType
  title: string
  message?: string
  buttons?: AlertButton[]
}

export interface AlertRef {
  show: (props: Omit<AlertState, 'visible'>) => void
  hide: () => void
}

export const AlertProvider = forwardRef<AlertRef>((_props, ref) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  })

  useImperativeHandle(ref, () => ({
    show: (props: Omit<AlertState, 'visible'>) => {
      setAlertState({
        visible: true,
        ...props,
      })
    },
    hide: () => {
      setAlertState(prev => ({ ...prev, visible: false }))
    },
  }))

  return (
    <CustomAlert
      visible={alertState.visible}
      type={alertState.type}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      onDismiss={() => setAlertState(prev => ({ ...prev, visible: false }))}
    />
  )
})

AlertProvider.displayName = 'AlertProvider'

// Helper function para usar como Alert.alert
export function createAlertHelper(alertRef: React.RefObject<AlertRef>) {
  return {
    alert: (
      title: string,
      message?: string,
      buttons?: AlertButton[],
      type?: AlertType,
    ) => {
      if (alertRef.current) {
        alertRef.current.show({
          title,
          message,
          buttons: buttons || [{ text: 'OK' }],
          type: type || 'info',
        })
      }
    },
  }
}

