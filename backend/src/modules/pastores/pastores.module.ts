import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { PastoresController } from "./pastores.controller"
import { PastoresService } from "./pastores.service"

@Module({
  imports: [PrismaModule],
  controllers: [PastoresController],
  providers: [PastoresService],
})
export class PastoresModule {}
