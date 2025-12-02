import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { PastoresController } from "./pastores.controller"
import { PastoresService } from "./pastores.service"
import { AuditService } from "../../common/services/audit.service"

@Module({
  imports: [PrismaModule],
  controllers: [PastoresController],
  providers: [PastoresService, AuditService],
  exports: [PastoresService],
})
export class PastoresModule {}
