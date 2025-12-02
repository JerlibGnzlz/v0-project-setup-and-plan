/* eslint-disable */
// @ts-nocheck
import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { AppModule } from "./app.module"
import { configureCloudinary } from "./modules/upload/cloudinary.config"
import { NestExpressApplication } from "@nestjs/platform-express"
import { IoAdapter } from "@nestjs/platform-socket.io"
import { join } from "path"
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter"
import helmet from "helmet"

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // ============================================
  // 🛡️ SEGURIDAD
  // ============================================

  // Helmet - Headers de seguridad (XSS, clickjacking, etc.)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }))

  // Validar JWT Secret en producción
  const jwtSecret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production' && (!jwtSecret || jwtSecret === 'your-secret-key')) {
    logger.error('⛔ JWT_SECRET no está configurado correctamente para producción!')
    process.exit(1)
  }

  app.setGlobalPrefix("api")

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  })

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Validation
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

  // WebSocket Adapter
  app.useWebSocketAdapter(new IoAdapter(app))

  // CORS - Configurado para web y mobile
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.FRONTEND_URL,
    // Mobile apps no tienen origin, se permite si no hay origin
  ].filter(Boolean) as string[]

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) {
        logger.debug('✅ Request sin origin permitido (mobile app, Postman, etc.)')
        return callback(null, true)
      }
      
      // En desarrollo, permitir todo localhost
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          logger.debug(`✅ Origin permitido (desarrollo): ${origin}`)
          return callback(null, true)
        }
      }
      
      // Permitir origins configurados
      if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes(origin))) {
        logger.debug(`✅ Origin permitido: ${origin}`)
        return callback(null, true)
      }
      
      logger.warn(`⚠️ Origin bloqueado por CORS: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Token', 'X-Device-Type'],
  })

  const port = process.env.PORT || 4000
  // Escuchar en 0.0.0.0 para permitir conexiones desde dispositivos móviles en la misma red
  await app.listen(port, '0.0.0.0')

  logger.log(`🚀 Backend running on http://localhost:${port}/api`)
  logger.log(`🛡️ Security: Helmet enabled, JWT auth active`)
}

bootstrap()
