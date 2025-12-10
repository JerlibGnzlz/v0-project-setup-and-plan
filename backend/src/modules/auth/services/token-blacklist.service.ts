import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import Redis from 'ioredis'
import type { RedisOptions } from 'ioredis'

/**
 * Servicio para manejar blacklist de tokens
 * Almacena tokens revocados en Redis hasta que expiren
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name)
  private redis: Redis | null = null

  private connectionAttempts = 0
  private readonly MAX_CONNECTION_ATTEMPTS = 3

  constructor() {
    // Inicializar Redis si está configurado
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      try {
        // Configurar opciones de Redis según si se usa URL o host/port
        const redisOptions: RedisOptions = process.env.REDIS_URL
          ? {
              // Usar URL directamente (ioredis soporta URLs)
              url: process.env.REDIS_URL,
              tls: process.env.REDIS_URL?.startsWith('rediss://')
                ? { rejectUnauthorized: false }
                : undefined,
              // Deshabilitar reconexión automática después de varios intentos
              retryStrategy: (times: number) => {
                this.connectionAttempts = times
                if (times > this.MAX_CONNECTION_ATTEMPTS) {
                  this.logger.warn(
                    `⚠️  Redis no disponible después de ${times} intentos. Token blacklist deshabilitado.`
                  )
                  this.logger.warn(
                    '   La aplicación continuará funcionando sin blacklist de tokens.'
                  )
                  this.redis = null
                  return null // Detener reconexión
                }
                const delay = Math.min(times * 50, 2000)
                return delay
              },
              enableOfflineQueue: false,
              maxRetriesPerRequest: 1,
            }
          : {
              // Usar host/port tradicional
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
              password: process.env.REDIS_PASSWORD || undefined,
              db: parseInt(process.env.REDIS_DB || '0'),
              // Deshabilitar reconexión automática después de varios intentos
              retryStrategy: (times: number) => {
                this.connectionAttempts = times
                if (times > this.MAX_CONNECTION_ATTEMPTS) {
                  this.logger.warn(
                    `⚠️  Redis no disponible después de ${times} intentos. Token blacklist deshabilitado.`
                  )
                  this.logger.warn(
                    '   La aplicación continuará funcionando sin blacklist de tokens.'
                  )
                  this.redis = null
                  return null // Detener reconexión
                }
                const delay = Math.min(times * 50, 2000)
                return delay
              },
              enableOfflineQueue: false,
              maxRetriesPerRequest: 1,
            }

        this.redis = new Redis(redisOptions)

        // Manejar eventos de Redis
        this.redis.on('error', (error: unknown) => {
          // Solo loguear errores si aún estamos intentando conectar (primeros intentos)
          // Después de MAX_CONNECTION_ATTEMPTS, no loguear más errores
          if (this.connectionAttempts <= this.MAX_CONNECTION_ATTEMPTS) {
            // Solo loguear el primer error, no todos
            if (this.connectionAttempts === 1) {
              this.logger.debug('⚠️  Intentando conectar a Redis...')
            }
          }
          // No establecer redis = null aquí, dejar que retryStrategy lo maneje
        })

        this.redis.on('connect', () => {
          this.logger.log('✅ Conectado a Redis para token blacklist')
          this.connectionAttempts = 0 // Resetear contador en conexión exitosa
        })

        this.redis.on('close', () => {
          // Solo loguear si aún estamos intentando conectar
          if (this.connectionAttempts <= this.MAX_CONNECTION_ATTEMPTS) {
            this.logger.debug('⚠️  Conexión a Redis cerrada')
          }
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.warn(`⚠️  Redis no disponible: ${errorMessage}`)
        this.logger.warn('   La aplicación continuará funcionando sin blacklist de tokens.')
        this.redis = null
      }
    } else {
      this.logger.log('ℹ️  Redis no configurado, token blacklist deshabilitado')
      this.logger.log('   La aplicación continuará funcionando sin blacklist de tokens.')
    }
  }

  async onModuleInit() {
    if (this.redis) {
      try {
        // Timeout para ping (5 segundos)
        const pingPromise = this.redis.ping()
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Redis ping timeout')), 5000)
        )

        await Promise.race([pingPromise, timeoutPromise])
        this.logger.log('✅ Token blacklist service inicializado')
      } catch (error) {
        this.logger.warn('⚠️  Redis no disponible, continuando sin blacklist')
        this.logger.warn('   La aplicación continuará funcionando sin blacklist de tokens.')
        // Cerrar conexión si existe
        if (this.redis) {
          try {
            this.redis.disconnect(false) // false = no reconectar
          } catch {
            // Ignorar errores al desconectar
          }
          this.redis = null
        }
      }
    } else {
      this.logger.log('ℹ️  Token blacklist service inicializado (modo sin Redis)')
    }
  }

  /**
   * Agregar token a la blacklist
   * @param token - Token a revocar
   * @param expiresIn - Tiempo en segundos hasta que el token expire naturalmente
   */
  async addToBlacklist(token: string, expiresIn: number = 900): Promise<void> {
    if (!this.redis) {
      this.logger.debug('Redis no disponible, saltando blacklist')
      return
    }

    try {
      // Calcular TTL: usar el tiempo restante del token o mínimo 1 hora
      const ttl = Math.max(expiresIn, 3600) // Mínimo 1 hora

      // Almacenar token con TTL
      await this.redis.setex(`blacklist:token:${token}`, ttl, '1')

      this.logger.debug(`✅ Token agregado a blacklist (TTL: ${ttl}s)`)
    } catch (error) {
      this.logger.error('❌ Error al agregar token a blacklist:', error)
      // No lanzar error, permitir que continúe sin blacklist
    }
  }

  /**
   * Verificar si un token está en la blacklist
   * @param token - Token a verificar
   * @returns true si el token está revocado
   */
  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.redis) {
      return false // Si Redis no está disponible, asumir que no está blacklisted
    }

    try {
      const result = await this.redis.get(`blacklist:token:${token}`)
      return result === '1'
    } catch (error) {
      this.logger.error('❌ Error al verificar blacklist:', error)
      return false // En caso de error, permitir el token (fail-open)
    }
  }

  /**
   * Remover token de la blacklist (útil para testing)
   */
  async removeFromBlacklist(token: string): Promise<void> {
    if (!this.redis) {
      return
    }

    try {
      await this.redis.del(`blacklist:token:${token}`)
      this.logger.debug('✅ Token removido de blacklist')
    } catch (error) {
      this.logger.error('❌ Error al remover token de blacklist:', error)
    }
  }

  /**
   * Limpiar todos los tokens expirados (tarea de mantenimiento)
   */
  async cleanup(): Promise<number> {
    if (!this.redis) {
      return 0
    }

    try {
      // Redis automáticamente elimina keys con TTL expirado
      // Esta función es principalmente para logging
      const keys = await this.redis.keys('blacklist:token:*')
      return keys.length
    } catch (error) {
      this.logger.error('❌ Error al limpiar blacklist:', error)
      return 0
    }
  }
}



