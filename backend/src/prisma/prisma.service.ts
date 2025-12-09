import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Database connected successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Failed to connect to database: ${errorMessage}`)
      // Reintentar conexión después de 5 segundos
      setTimeout(async () => {
        try {
          await this.$connect()
          this.logger.log('Database reconnected successfully')
        } catch (retryError: unknown) {
          const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Error desconocido'
          this.logger.error(`Failed to reconnect to database: ${retryErrorMessage}`)
        }
      }, 5000)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }
}
