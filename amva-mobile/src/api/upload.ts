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

    const response = await apiClient.post<UploadResponse>('/upload/inscripcion-documento', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// Helper para seleccionar imagen desde la galería o cámara
export async function pickImage(): Promise<string | null> {
  try {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu galería para seleccionar el comprobante.'
      )
      return null
    }

    // Abrir selector de imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      return asset.uri
    }

    return null
  } catch (error) {
    console.error('Error seleccionando imagen:', error)
    return null
  }
}


