/* eslint-disable */
// @ts-nocheck
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { configureCloudinary } from './modules/upload/cloudinary.config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { join } from 'path'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter'
import helmet from 'helmet'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // ============================================
  // 🛡️ SEGURIDAD
  // ============================================

  // Helmet - Headers de seguridad (XSS, clickjacking, etc.)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  )

  // Validar JWT Secret en producción
  const jwtSecret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (!jwtSecret || jwtSecret === 'your-secret-key') {
      logger.error('⛔ JWT_SECRET no está configurado correctamente para producción!')
      process.exit(1)
    }
    // Validar que el JWT_SECRET tenga al menos 32 caracteres para mayor seguridad
    if (jwtSecret.length < 32) {
      logger.error('⛔ JWT_SECRET debe tener al menos 32 caracteres para producción!')
      logger.error(`   Longitud actual: ${jwtSecret.length} caracteres`)
      process.exit(1)
    }
    logger.log('✅ JWT_SECRET validado correctamente (mínimo 32 caracteres)')
  }

  // Validar configuración de Google OAuth (solo si está habilitado)
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (googleClientId && googleClientSecret) {
    // Validar que no sean valores de ejemplo
    if (
      googleClientId.includes('tu-client-id') ||
      googleClientId.includes('example') ||
      googleClientSecret.includes('tu-client-secret') ||
      googleClientSecret.includes('example')
    ) {
      logger.warn(
        '⚠️  Google OAuth configurado con valores de ejemplo. Verifica GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET'
      )
    } else {
      logger.log('✅ Google OAuth configurado correctamente')
    }
  } else {
    logger.warn(
      '⚠️  Google OAuth no está configurado. La autenticación con Google no estará disponible.'
    )
  }

  app.setGlobalPrefix('api')

  // ============================================
  // 🔒 HTTPS ENFORCEMENT (Producción)
  // ============================================
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      // Verificar si la request viene a través de un proxy (Railway, Vercel, etc.)
      const forwardedProto = req.headers['x-forwarded-proto']
      const host = req.headers.host

      // No redirigir si es localhost (desarrollo)
      if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return next()
      }

      // Si no es HTTPS y estamos en producción, redirigir
      if (forwardedProto && forwardedProto !== 'https' && host) {
        logger.warn(`⚠️  Redirigiendo HTTP a HTTPS: ${host}${req.url}`)
        return res.redirect(301, `https://${host}${req.url}`)
      }

      // También verificar el protocolo directo (si no hay proxy)
      if (!forwardedProto && req.protocol !== 'https' && host) {
        logger.warn(`⚠️  Redirigiendo HTTP a HTTPS: ${host}${req.url}`)
        return res.redirect(301, `https://${host}${req.url}`)
      }

      next()
    })
    logger.log('✅ HTTPS enforcement habilitado para producción')
  }

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
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
    })
  )

  configureCloudinary(logger)

  // CORS - Configurado para web y mobile
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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

      // Permitir todos los dominios de Vercel (producción y previews)
      // Vercel genera URLs como: https://app-name-xxx-username.vercel.app
      if (origin.includes('.vercel.app') || origin.includes('vercel.app')) {
        logger.debug(`✅ Origin permitido (Vercel): ${origin}`)
        return callback(null, true)
      }

      // Permitir origins configurados explícitamente
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

  // Obtener el servidor HTTP antes de que empiece a escuchar
  const httpServer = app.getHttpServer()

  // Configurar WebSocket Adapter con el servidor HTTP
  app.useWebSocketAdapter(new IoAdapter(httpServer))

  const port = process.env.PORT || 4000
  // Escuchar en 0.0.0.0 para permitir conexiones desde dispositivos móviles en la misma red
  await app.listen(port, '0.0.0.0')

  logger.log(`🚀 Backend running on http://localhost:${port}/api`)
  logger.log(`🛡️ Security: Helmet enabled, JWT auth active`)
  logger.log(`🔌 WebSocket: Socket.IO configurado`)
}

bootstrap()
