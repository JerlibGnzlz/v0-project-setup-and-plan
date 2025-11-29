import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authApi, type Pastor } from '@api/auth'

interface AuthContextValue {
    pastor: Pastor | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [pastor, setPastor] = useState<Pastor | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        let bootstrapCompleted = false

        const bootstrap = async () => {
            try {
                console.log('🚀 Iniciando bootstrap de autenticación...')
                
                // Timeout de seguridad: si tarda más de 8 segundos, continuar sin token
                timeoutId = setTimeout(() => {
                    if (isMounted && !bootstrapCompleted) {
                        console.log('⏱️ Timeout en bootstrap (8s), continuando sin autenticación')
                        bootstrapCompleted = true
                        setLoading(false)
                    }
                }, 8000)

                const token = await SecureStore.getItemAsync('access_token')
                if (token) {
                    console.log('🔍 Token encontrado, verificando validez...')
                    try {
                        // Timeout más corto para la petición me() (5 segundos)
                        const mePromise = authApi.me()
                        const timeoutPromise = new Promise<never>((_, reject) => 
                            setTimeout(() => reject(new Error('Request timeout')), 5000)
                        )
                        
                        const me = await Promise.race<Pastor>([mePromise, timeoutPromise])
                        
                        if (isMounted && !bootstrapCompleted) {
                            setPastor(me)
                            console.log('✅ Token válido, pastor cargado:', me.email)
                        }
                    } catch (error: any) {
                        console.error('❌ Error al verificar token:', {
                            status: error?.response?.status,
                            message: error?.message,
                            url: error?.config?.url
                        })
                        
                        // Si es un error de red o timeout, no limpiar tokens (puede ser temporal)
                        if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
                            console.log('⚠️ Timeout o error de red, manteniendo tokens')
                        } else if (error?.response?.status === 401) {
                            // Solo limpiar si es 401 y no hay refresh token o ya se intentó refrescar
                            const refreshToken = await SecureStore.getItemAsync('refresh_token')
                            if (!refreshToken || error?.config?._retry) {
                                if (isMounted) {
                                    console.log('🧹 Limpiando tokens (401 sin refresh posible)')
                                    await SecureStore.deleteItemAsync('access_token')
                                    await SecureStore.deleteItemAsync('refresh_token')
                                }
                            } else {
                                console.log('ℹ️ 401 recibido, el interceptor intentará refrescar')
                            }
                        }
                    }
                } else {
                    console.log('ℹ️ No hay token guardado, usuario no autenticado')
                }
            } catch (error: any) {
                console.error('❌ Error crítico en bootstrap:', {
                    message: error?.message,
                    stack: error?.stack
                })
                // En caso de error crítico, limpiar todo
                if (isMounted) {
                    try {
                        await SecureStore.deleteItemAsync('access_token')
                        await SecureStore.deleteItemAsync('refresh_token')
                    } catch (cleanupError) {
                        console.error('❌ Error limpiando tokens:', cleanupError)
                    }
                }
            } finally {
                if (timeoutId) {
                    clearTimeout(timeoutId)
                }
                if (isMounted && !bootstrapCompleted) {
                    bootstrapCompleted = true
                    console.log('✅ Bootstrap completado')
                    setLoading(false)
                }
            }
        }
        
        void bootstrap()

        return () => {
            isMounted = false
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        try {
            console.log('🔐 useAuth: Iniciando login...')
            const { access_token, refresh_token, pastor } = await authApi.login(email, password)
            console.log('✅ useAuth: Login exitoso, guardando tokens...')
            await SecureStore.setItemAsync('access_token', access_token)
            await SecureStore.setItemAsync('refresh_token', refresh_token)
            setPastor(pastor)
            console.log('✅ useAuth: Tokens guardados, pastor establecido')
        } catch (error) {
            console.error('❌ useAuth: Error en login:', error)
            throw error // Re-lanzar para que LoginScreen lo maneje
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
        setPastor(null)
    }

    return (
        <AuthContext.Provider value={{ pastor, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return ctx
}


