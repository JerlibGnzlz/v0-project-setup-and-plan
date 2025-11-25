/* eslint-disable */
// @ts-nocheck
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"
import { configureCloudinary } from "./modules/upload/cloudinary.config"
import { NestExpressApplication } from "@nestjs/platform-express"
import { join } from "path"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix("api")

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  })

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  configureCloudinary()

  app.enableCors({
    origin: ["http://localhost:3000", "https://v0-ministerio-amva.vercel.app", process.env.FRONTEND_URL].filter(
      Boolean,
    ),
    credentials: true,
  })

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Backend API running on http://localhost:${port}/api`)
}

bootstrap()
