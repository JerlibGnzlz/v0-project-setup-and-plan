/* eslint-disable */
// @ts-nocheck
import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { AppModule } from "./app.module"
import { configureCloudinary } from "./modules/upload/cloudinary.config"
import { NestExpressApplication } from "@nestjs/platform-express"
import { join } from "path"
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix("api")

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  })

  // Global Exception Filter - Manejo consistente de errores
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Enable validation globally with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  configureCloudinary()

  // CORS configuration for production
  const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes(origin))) {
        return callback(null, true)
      }

      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = process.env.PORT || 4000
  await app.listen(port)

  logger.log(`🚀 Backend API running on http://localhost:${port}/api`)
  logger.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  logger.log(`✨ Clean Architecture: BaseService, Repository Pattern, Global Filters enabled`)
}

bootstrap()
