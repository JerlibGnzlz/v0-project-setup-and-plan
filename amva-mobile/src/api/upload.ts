/**
 * API para subida de archivos - Mobile
 */

import { apiClient } from './client'
import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'

export interface UploadResponse {
  success: boolean
  url: string
  publicId: string
}

export const uploadApi = {
  // Subir documento de inscripción (público, no requiere autenticación)
  uploadInscripcionDocumento: async (uri: string): Promise<UploadResponse> => {
    const formData = new FormData()

    // En React Native, FormData acepta objetos con uri, type, name
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'documento.jpg',
    } as any)

    const response = await apiClient.post<UploadResponse>(
      '/upload/inscripcion-documento',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}

// Helper para seleccionar imagen desde la galería o cámara
export async function pickImage(source: 'gallery' | 'camera' = 'gallery'): Promise<string | null> {
  try {
    console.log(`📸 Seleccionando imagen desde: ${source}`)

    // Solicitar permisos según la fuente
    if (source === 'camera') {
      const { status: cameraStatus, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync()
      console.log(`📷 Estado de permisos de cámara: ${cameraStatus}, puede preguntar de nuevo: ${canAskAgain}`)
      
      if (cameraStatus !== 'granted') {
        const message = cameraStatus === 'denied' && !canAskAgain
          ? 'Los permisos de cámara están denegados permanentemente. Por favor, habilítalos en la configuración de la aplicación.'
          : 'Necesitamos acceso a tu cámara para tomar una foto del comprobante. Por favor, otorga los permisos cuando se te solicite.'
        
        Alert.alert('Permisos de cámara necesarios', message)
        return null
      }
    } else {
      const { status: mediaStatus, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      console.log(`🖼️ Estado de permisos de galería: ${mediaStatus}, puede preguntar de nuevo: ${canAskAgain}`)
      
      if (mediaStatus !== 'granted') {
        const message = mediaStatus === 'denied' && !canAskAgain
          ? 'Los permisos de galería están denegados permanentemente. Por favor, habilítalos en la configuración de la aplicación.'
          : 'Necesitamos acceso a tu galería para seleccionar el comprobante. Por favor, otorga los permisos cuando se te solicite.'
        
        Alert.alert('Permisos de galería necesarios', message)
        return null
      }
    }

    // Abrir selector según la fuente
    console.log(`🚀 Abriendo ${source === 'camera' ? 'cámara' : 'galería'}...`)
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          allowsMultipleSelection: false,
        })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      console.log(`✅ Imagen seleccionada exitosamente:`)
      console.log(`   - URI: ${asset.uri}`)
      console.log(`   - Tipo: ${asset.type}`)
      console.log(`   - Tamaño: ${asset.width}x${asset.height}`)
      console.log(`   - Peso: ${asset.fileSize ? (asset.fileSize / 1024).toFixed(2) + ' KB' : 'desconocido'}`)
      return asset.uri
    }

    console.log('ℹ️ Selección de imagen cancelada por el usuario')
    return null
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error seleccionando imagen:', errorMessage)
    console.error('❌ Error completo:', error)
    
    // Mensajes de error más específicos
    let alertMessage = 'No se pudo seleccionar la imagen. Por favor, intenta de nuevo.'
    if (errorMessage.includes('camera') || errorMessage.includes('Camera')) {
      alertMessage = 'No se pudo abrir la cámara. Verifica que la cámara esté disponible y que tengas los permisos necesarios.'
    } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
      alertMessage = 'No se pudieron obtener los permisos necesarios. Por favor, verifica la configuración de la aplicación.'
    }
    
    Alert.alert('Error al seleccionar imagen', alertMessage)
    return null
  }
}
