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
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu cámara para tomar una foto del comprobante.'
        )
        return null
      }
    } else {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (mediaStatus !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para seleccionar el comprobante.'
        )
        return null
      }
    }

    // Abrir selector según la fuente
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
      console.log(`✅ Imagen seleccionada: ${asset.uri}`)
      return asset.uri
    }

    console.log('ℹ️ Selección de imagen cancelada')
    return null
  } catch (error) {
    console.error('❌ Error seleccionando imagen:', error)
    Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor, intenta de nuevo.')
    return null
  }
}
