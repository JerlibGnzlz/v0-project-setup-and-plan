import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { AuditService } from './common/services/audit.service'
import { AuthModule } from './modules/auth/auth.module'
import { ConvencionesModule } from './modules/convenciones/convenciones.module'
import { PastoresModule } from './modules/pastores/pastores.module'
import { GaleriaModule } from './modules/galeria/galeria.module'
import { InscripcionesModule } from './modules/inscripciones/inscripciones.module'
import { NoticiasModule } from './modules/noticias/noticias.module'
import { UploadModule } from './modules/upload/upload.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MercadoPagoModule } from './modules/mercado-pago/mercado-pago.module'
import { CredencialesMinisterialesModule } from './modules/credenciales-ministeriales/credenciales-ministeriales.module'
import { CredencialesCapellaniaModule } from './modules/credenciales-capellania/credenciales-capellania.module'
import { CredencialesModule } from './modules/credenciales/credenciales.module'
import { SedesModule } from './modules/sedes/sedes.module'
import { PublicModule } from './modules/public/public.module'
import { SolicitudesCredencialesModule } from './modules/solicitudes-credenciales/solicitudes-credenciales.module'
import { DataSyncModule } from './modules/data-sync/data-sync.module'

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // Para tareas programadas (cron jobs)
    // Rate Limiting - Protección contra abuso y ataques
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 60, // 60 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 1000, // 1000 requests por hora
      },
    ]),
    EventEmitterModule.forRoot({
      // Configuración global de eventos
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    AuthModule,
    ConvencionesModule,
    PastoresModule,
    GaleriaModule,
    InscripcionesModule,
    NoticiasModule,
    UploadModule,
    NotificationsModule,
    MercadoPagoModule,
    CredencialesMinisterialesModule,
    CredencialesCapellaniaModule,
    CredencialesModule,
    SedesModule,
    PublicModule,
    SolicitudesCredencialesModule,
    DataSyncModule,
  ],
  providers: [
    // Guard global para rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Servicio de auditoría global
    AuditService,
  ],
  exports: [AuditService],
})
export class AppModule {}
