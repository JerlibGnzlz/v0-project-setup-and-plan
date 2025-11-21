import { Module } from "@nestjs/common"
import { PastoresController } from "./pastores.controller"
import { PastoresService } from "./pastores.service"

@Module({
  controllers: [PastoresController],
  providers: [PastoresService],
})
export class PastoresModule {}
