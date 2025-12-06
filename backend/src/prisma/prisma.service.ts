import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Failed to connect to database:', error)
      // Reintentar conexión después de 5 segundos
      setTimeout(async () => {
        try {
          await this.$connect()
          console.log('✅ Database reconnected successfully')
        } catch (retryError) {
          console.error('❌ Failed to reconnect to database:', retryError)
        }
      }, 5000)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    console.log('🔌 Database disconnected')
  }
}
