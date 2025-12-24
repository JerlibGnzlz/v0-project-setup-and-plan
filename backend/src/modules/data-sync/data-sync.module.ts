import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { DataSyncGateway } from './data-sync.gateway'

@Module({
  imports: [JwtModule],
  providers: [DataSyncGateway],
  exports: [DataSyncGateway], // Exportar para uso en otros módulos
})
export class DataSyncModule {}

