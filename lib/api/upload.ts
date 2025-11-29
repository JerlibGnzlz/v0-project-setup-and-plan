import apiClient from "./client"

export interface UploadResponse {
  success: boolean
  url: string
  publicId: string
}

export const uploadApi = {
  // Upload image for pastor profile
  uploadPastorImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<UploadResponse>("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload image for gallery
  uploadGaleriaImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<UploadResponse>("/upload/galeria", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload image for noticias
  uploadNoticiaImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<UploadResponse>("/upload/galeria", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload video with optional trimming
  uploadVideo: async (
    file: File,
    trimOptions?: { startTime: number; endTime: number }
  ): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    // Add trim parameters if provided
    if (trimOptions) {
      formData.append("startTime", trimOptions.startTime.toString())
      formData.append("endTime", trimOptions.endTime.toString())
    }

    const response = await apiClient.post<UploadResponse>("/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload comprobante de pago
  uploadComprobantePago: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<UploadResponse>("/upload/galeria", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Upload documento de inscripción (público)
  uploadInscripcionDocumento: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.post<UploadResponse>("/upload/inscripcion-documento", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}
