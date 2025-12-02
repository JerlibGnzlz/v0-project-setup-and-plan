"use client"

import { useState, useEffect, useCallback } from "react"
import { unifiedAuthApi } from "@/lib/api/unified-auth"
import { invitadoAuthApi } from "@/lib/api/invitado-auth"
import { pastorAuthApi } from "@/lib/api/pastor-auth"

interface UnifiedUser {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipo: 'PASTOR' | 'INVITADO' | 'ADMIN'
  // Campos adicionales para pastores
  cargo?: string
  ministerio?: string
  region?: string
  pais?: string
  fotoUrl?: string
}

interface UnifiedAuthState {
  user: UnifiedUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  userType: 'PASTOR' | 'INVITADO' | 'ADMIN' | null
}

export function useUnifiedAuth() {
  const [state, setState] = useState<UnifiedAuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isHydrated: false,
    userType: null,
  })

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") {
      setState(prev => ({ ...prev, isHydrated: true }))
      return
    }

    // Verificar invitado primero
    const invitadoToken = localStorage.getItem('invitado_token')
    const invitadoUser = localStorage.getItem('invitado_user')
    
    if (invitadoToken && invitadoUser) {
      try {
        const user = JSON.parse(invitadoUser)
        setState({
          user: {
            ...user,
            tipo: 'INVITADO' as const,
          },
          token: invitadoToken,
          refreshToken: localStorage.getItem('invitado_refresh_token') || null,
          isAuthenticated: true,
          isHydrated: true,
          userType: 'INVITADO',
        })
        return
      } catch (e) {
        console.error('Error parsing invitado user:', e)
      }
    }

    // Verificar pastor
    const pastorToken = localStorage.getItem('pastor_auth_token')
    const pastorUser = localStorage.getItem('pastor_auth_user')
    
    if (pastorToken && pastorUser) {
      try {
        const user = JSON.parse(pastorUser)
        setState({
          user: {
            ...user,
            tipo: 'PASTOR' as const,
          },
          token: pastorToken,
          refreshToken: localStorage.getItem('pastor_refresh_token') || null,
          isAuthenticated: true,
          isHydrated: true,
          userType: 'PASTOR',
        })
        return
      } catch (e) {
        console.error('Error parsing pastor user:', e)
      }
    }

    // Verificar admin
    const adminToken = localStorage.getItem('auth_token')
    const adminUser = localStorage.getItem('auth_user')
    
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser)
        setState({
          user: {
            ...user,
            tipo: 'ADMIN' as const,
          },
          token: adminToken,
          refreshToken: null,
          isAuthenticated: true,
          isHydrated: true,
          userType: 'ADMIN',
        })
        return
      } catch (e) {
        console.error('Error parsing admin user:', e)
      }
    }

    setState(prev => ({ ...prev, isHydrated: true }))
  }, []) // Sin dependencias porque solo lee de localStorage

  // Verificar autenticación al montar (solo una vez)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    try {
      const response = await unifiedAuthApi.login({ email, password })
      
      // Asegurar que el usuario tenga todos los campos necesarios
      const userData: UnifiedUser = {
        id: response.user.id,
        nombre: response.user.nombre,
        apellido: response.user.apellido,
        email: response.user.email,
        telefono: response.user.telefono,
        sede: response.user.sede,
        tipo: response.user.tipo,
      }
      
      // Guardar según el tipo de usuario
      if (typeof window !== 'undefined') {
        if (response.user.tipo === 'INVITADO') {
          localStorage.setItem('invitado_token', response.access_token)
          localStorage.setItem('invitado_refresh_token', response.refresh_token)
          localStorage.setItem('invitado_user', JSON.stringify(userData))
        } else if (response.user.tipo === 'PASTOR') {
          localStorage.setItem('pastor_auth_token', response.access_token)
          localStorage.setItem('pastor_refresh_token', response.refresh_token)
          localStorage.setItem('pastor_auth_user', JSON.stringify(userData))
        } else if (response.user.tipo === 'ADMIN') {
          localStorage.setItem('auth_token', response.access_token)
          localStorage.setItem('auth_user', JSON.stringify(userData))
        }
      }

      setState({
        user: userData,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isHydrated: true,
        userType: response.user.tipo,
      })

      return response
    } catch (error) {
      throw error
    }
  }

  const registerInvitado = async (data: {
    nombre: string
    apellido: string
    email: string
    password: string
    telefono?: string
    sede?: string
  }) => {
    try {
      const response = await invitadoAuthApi.registerComplete(data)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('invitado_token', response.access_token)
        localStorage.setItem('invitado_refresh_token', response.refresh_token)
        localStorage.setItem('invitado_user', JSON.stringify(response.invitado))
      }

      setState({
        user: {
          ...response.invitado,
          tipo: 'INVITADO' as const,
        },
        token: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isHydrated: true,
        userType: 'INVITADO',
      })

      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('invitado_token')
      localStorage.removeItem('invitado_refresh_token')
      localStorage.removeItem('invitado_user')
      localStorage.removeItem('pastor_auth_token')
      localStorage.removeItem('pastor_refresh_token')
      localStorage.removeItem('pastor_auth_user')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }

    setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: true,
      userType: null,
    })
  }

  return {
    ...state,
    login,
    registerInvitado,
    logout,
    checkAuth,
  }
}

