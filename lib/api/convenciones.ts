import { apiClient } from './client'

export interface Convencion {
  id: string
  titulo: string
  descripcion?: string
  fechaInicio: string
  /** Día del evento en formato YYYY-MM-DD (sin hora) para cuenta regresiva sin ambigüedad de zona horaria */
  fechaInicioDateOnly?: string
  fechaFin: string
  ubicacion: string
  costo?: number
  cupoMaximo?: number
  imagenUrl?: string
  activa: boolean
  archivada?: boolean
  fechaArchivado?: string
  invitadoNombre?: string
  invitadoFotoUrl?: string
  contactoNombre?: string
  contactoTelefono?: string
  aliasCbu?: string
  titularTransferencia?: string
  numeroCuenta?: string
  cbu?: string
  cuil?: string
  createdAt: string
  updatedAt: string
}

export const convencionesApi = {
  getAll: async (): Promise<Convencion[]> => {
    const response = await apiClient.get<Convencion[]>('/convenciones')
    return response.data
  },

  getById: async (id: string): Promise<Convencion> => {
    const response = await apiClient.get<Convencion>(`/convenciones/${id}`)
    return response.data
  },

  /** Fecha del evento activo (YYYY-MM-DD). Fuente única para la cuenta regresiva. */
  getEventDate: async (): Promise<{ dateOnly: string } | null> => {
    try {
      const response = await apiClient.get<{ dateOnly: string }>('/convenciones/event-date')
      if (response.data?.dateOnly && /^\d{4}-\d{2}-\d{2}$/.test(response.data.dateOnly)) {
        return { dateOnly: response.data.dateOnly }
      }
      return null
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 404) return null
      return null
    }
  },

  /**
   * Normaliza la convención activa: el backend puede enviar fechaInicio (ISO) y/o fechaInicioDateOnly (YYYY-MM-DD).
   * Aseguramos que tengamos fechaInicioDateOnly para la cuenta regresiva.
   */
  getActive: async (): Promise<Convencion | null> => {
    try {
      type Raw = Convencion & {
        contacto_nombre?: string
        contacto_telefono?: string
        alias_cbu?: string
        titular_transferencia?: string
        numero_cuenta?: string
        cbu?: string
        cuil?: string
      }
      const response = await apiClient.get<Raw>('/convenciones/active')
      const raw = response.data
      if (!raw || !raw.id) {
        return null
      }
      const fechaInicio = raw.fechaInicio != null ? String(raw.fechaInicio).trim() : ''
      const fromDateOnly =
        raw.fechaInicioDateOnly && /^\d{4}-\d{2}-\d{2}$/.test(String(raw.fechaInicioDateOnly).trim())
          ? String(raw.fechaInicioDateOnly).trim()
          : null
      const fechaInicioDateOnly = fromDateOnly ?? (fechaInicio.length >= 10 ? fechaInicio.slice(0, 10) : undefined)
      const contactoNombre = raw.contactoNombre ?? raw.contacto_nombre
      const contactoTelefono = raw.contactoTelefono ?? raw.contacto_telefono
      const aliasCbu = raw.aliasCbu ?? raw.alias_cbu
      const titularTransferencia = raw.titularTransferencia ?? raw.titular_transferencia
      const numeroCuenta = raw.numeroCuenta ?? raw.numero_cuenta
      const cbu = raw.cbu
      const cuil = raw.cuil
      return {
        ...raw,
        fechaInicio: fechaInicio || raw.fechaInicio,
        ...(fechaInicioDateOnly && { fechaInicioDateOnly }),
        contactoNombre: contactoNombre ?? undefined,
        contactoTelefono: contactoTelefono ?? undefined,
        aliasCbu: aliasCbu ?? undefined,
        titularTransferencia: titularTransferencia ?? undefined,
        numeroCuenta: numeroCuenta ?? undefined,
        cbu: cbu ?? undefined,
        cuil: cuil ?? undefined,
      } as Convencion
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      // 404 significa que no hay convención activa
      if (err.response?.status === 404) {
        console.log('📭 No hay convención activa')
        return null
      }
      // 500 generalmente significa problema de base de datos
      if (err.response?.status === 500) {
        console.error(
          '❌ Error de servidor (posible problema de base de datos):',
          err.response?.data?.message || err.message
        )
        // Retornar null en lugar de lanzar error para que el frontend pueda manejar esto
        return null
      }
      console.error('❌ Error obteniendo convención activa:', error)
      // Para otros errores, retornar null en lugar de lanzar
      return null
    }
  },

  create: async (data: Omit<Convencion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Convencion> => {
    const response = await apiClient.post<Convencion>('/convenciones', data)
    return response.data
  },

  update: async (id: string, data: Partial<Convencion>): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}`, data)
    return response.data
  },

  archivar: async (id: string): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}/archivar`)
    return response.data
  },

  desarchivar: async (id: string): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}/desarchivar`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/convenciones/${id}`)
  },
}
