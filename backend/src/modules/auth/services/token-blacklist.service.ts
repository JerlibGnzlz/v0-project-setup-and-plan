import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import Redis from 'ioredis'

/**
 * Servicio para manejar blacklist de tokens
 * Almacena tokens revocados en Redis hasta que expiren
 */
@Injectable()
export class TokenBlacklistService implements OnModuleInit {
  private readonly logger = new Logger(TokenBlacklistService.name)
  private redis: Redis | null = null

  constructor() {
    // Inicializar Redis si está configurado
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      try {
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0'),
          retryStrategy: times => {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
        })

        this.redis.on('error', error => {
          this.logger.error('❌ Error de conexión a Redis:', error)
          this.redis = null
        })

        this.redis.on('connect', () => {
          this.logger.log('✅ Conectado a Redis para token blacklist')
        })
      } catch (error) {
        this.logger.warn('⚠️  Redis no disponible, token blacklist deshabilitado')
        this.redis = null
      }
    } else {
      this.logger.warn('⚠️  Redis no configurado, token blacklist deshabilitado')
    }
  }

  async onModuleInit() {
    if (this.redis) {
      try {
        await this.redis.ping()
        this.logger.log('✅ Token blacklist service inicializado')
      } catch (error) {
        this.logger.warn('⚠️  Redis no disponible, continuando sin blacklist')
        this.redis = null
      }
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

