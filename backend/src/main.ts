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

  // ============================================
  // 📄 RUTAS PÚBLICAS (sin prefijo /api)
  // ============================================
  // Estas rutas deben ser accesibles sin el prefijo /api para Google OAuth
  app.getHttpAdapter().get('/privacy-policy', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - AMVA Go</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #22c55e; }
        h2 { color: #16a34a; margin-top: 30px; }
        ul { margin: 10px 0; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Política de Privacidad</h1>
    <p class="last-updated"><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h2>1. Información que Recopilamos</h2>
    <p>AMVA Go (Asociación Misionera Vida Abundante) recopila la siguiente información cuando usas Google Sign-In:</p>
    <ul>
        <li>Nombre y apellido</li>
        <li>Dirección de correo electrónico</li>
        <li>Foto de perfil (opcional)</li>
        <li>ID único de Google</li>
    </ul>
    
    <h2>2. Uso de la Información</h2>
    <p>Utilizamos esta información para:</p>
    <ul>
        <li>Crear y gestionar tu cuenta de usuario</li>
        <li>Proporcionar acceso a las funcionalidades de la aplicación</li>
        <li>Enviar notificaciones relacionadas con tu cuenta y actividades</li>
        <li>Mejorar nuestros servicios</li>
    </ul>
    
    <h2>3. Protección de Datos</h2>
    <p>Protegemos tu información utilizando medidas de seguridad estándar de la industria, incluyendo:</p>
    <ul>
        <li>Cifrado de datos en tránsito (HTTPS)</li>
        <li>Almacenamiento seguro de credenciales</li>
        <li>Acceso restringido a información personal</li>
    </ul>
    
    <h2>4. Compartir Información</h2>
    <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera.</p>
    
    <h2>5. Tus Derechos</h2>
    <p>Tienes derecho a:</p>
    <ul>
        <li>Acceder a tu información personal</li>
        <li>Corregir información incorrecta</li>
        <li>Solicitar la eliminación de tu cuenta</li>
        <li>Retirar tu consentimiento en cualquier momento</li>
    </ul>
    
    <h2>6. Contacto</h2>
    <p>Para preguntas sobre esta política de privacidad o para ejercer tus derechos, contacta:</p>
    <p><strong>Email:</strong> jerlibgnzlz@gmail.com</p>
    <p><strong>Organización:</strong> Asociación Misionera Vida Abundante (AMVA)</p>
</body>
</html>
    `
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  })

  app.getHttpAdapter().get('/terms-of-service', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos de Servicio - AMVA Go</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #22c55e; }
        h2 { color: #16a34a; margin-top: 30px; }
        ul { margin: 10px 0; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>Términos de Servicio</h1>
    <p class="last-updated"><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h2>1. Aceptación de los Términos</h2>
    <p>Al acceder y usar AMVA Go, aceptas estos términos de servicio. Si no estás de acuerdo con alguno de estos términos, no debes usar la aplicación.</p>
    
    <h2>2. Uso de la Aplicación</h2>
    <p>AMVA Go es una aplicación móvil desarrollada para la Asociación Misionera Vida Abundante. La aplicación permite:</p>
    <ul>
        <li>Registro e inscripción a convenciones</li>
        <li>Consulta de credenciales ministeriales</li>
        <li>Acceso a noticias y actualizaciones</li>
        <li>Gestión de perfil de usuario</li>
    </ul>
    
    <h2>3. Cuenta de Usuario</h2>
    <p>Para usar ciertas funcionalidades, necesitas crear una cuenta. Eres responsable de:</p>
    <ul>
        <li>Mantener la confidencialidad de tus credenciales</li>
        <li>Toda la actividad que ocurra bajo tu cuenta</li>
        <li>Proporcionar información precisa y actualizada</li>
    </ul>
    
    <h2>4. Conducta del Usuario</h2>
    <p>No debes:</p>
    <ul>
        <li>Usar la aplicación para fines ilegales</li>
        <li>Intentar acceder a áreas restringidas</li>
        <li>Interferir con el funcionamiento de la aplicación</li>
        <li>Compartir información falsa o engañosa</li>
    </ul>
    
    <h2>5. Propiedad Intelectual</h2>
    <p>Todo el contenido de AMVA Go, incluyendo texto, gráficos, logos y software, es propiedad de la Asociación Misionera Vida Abundante y está protegido por leyes de propiedad intelectual.</p>
    
    <h2>6. Limitación de Responsabilidad</h2>
    <p>AMVA Go se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables por daños directos, indirectos o consecuentes derivados del uso de la aplicación.</p>
    
    <h2>7. Modificaciones</h2>
    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarse en esta página.</p>
    
    <h2>8. Contacto</h2>
    <p>Para preguntas sobre estos términos de servicio, contacta:</p>
    <p><strong>Email:</strong> jerlibgnzlz@gmail.com</p>
    <p><strong>Organización:</strong> Asociación Misionera Vida Abundante (AMVA)</p>
</body>
</html>
    `
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  })

  logger.log('✅ Rutas públicas configuradas: /privacy-policy, /terms-of-service')

  app.setGlobalPrefix('api')

  // Sanitizar body de POST /api/solicitudes-credenciales para evitar 400 por forbidNonWhitelisted (props extra)
  const ALLOWED_CREATE_SOLICITUD_KEYS = [
    'tipo',
    'dni',
    'nombre',
    'apellido',
    'nacionalidad',
    'tipoPastor',
    'fechaNacimiento',
    'motivo',
  ]
  app.use((req, res, next) => {
    const pathMatch =
      req.path?.includes('solicitudes-credenciales') ||
      req.url?.includes?.('solicitudes-credenciales')
    if (req.method === 'POST' && pathMatch) {
      if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        const sanitized: Record<string, unknown> = {}
        for (const key of ALLOWED_CREATE_SOLICITUD_KEYS) {
          if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            const v = req.body[key]
            if (v !== undefined && v !== null) sanitized[key] = v
          }
        }
        // Solo reemplazar si hay algo (evita pisar body vacío si el parser no corrió aún)
        if (Object.keys(sanitized).length > 0) req.body = sanitized
      }
    }
    next()
  })

  // ============================================
  // 🔒 HTTPS ENFORCEMENT (Producción con SSL)
  // Solo redirigir si DISABLE_HTTPS_ENFORCEMENT no está definido
  // y el frontend usa HTTPS (ej: Vercel, dominio con Let's Encrypt)
  // Para Digital Ocean sin SSL, definir DISABLE_HTTPS_ENFORCEMENT=true en .env
  // ============================================
  const disableHttpsEnforcement = process.env.DISABLE_HTTPS_ENFORCEMENT === 'true'
  if (process.env.NODE_ENV === 'production' && !disableHttpsEnforcement) {
    const frontendUrl = process.env.FRONTEND_URL || ''
    const useHttps = frontendUrl.startsWith('https://')
    if (useHttps) {
      app.use((req, res, next) => {
        const forwardedProto = req.headers['x-forwarded-proto']
        const host = req.headers.host

        if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
          return next()
        }

        if (forwardedProto && forwardedProto !== 'https' && host) {
          logger.warn(`⚠️  Redirigiendo HTTP a HTTPS: ${host}${req.url}`)
          return res.redirect(301, `https://${host}${req.url}`)
        }

        if (!forwardedProto && req.protocol !== 'https' && host) {
          logger.warn(`⚠️  Redirigiendo HTTP a HTTPS: ${host}${req.url}`)
          return res.redirect(301, `https://${host}${req.url}`)
        }

        next()
      })
      logger.log('✅ HTTPS enforcement habilitado para producción')
    } else {
      logger.log('ℹ️  HTTPS enforcement deshabilitado (FRONTEND_URL usa HTTP)')
    }
  }

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Global Logging Interceptor
  const { LoggingInterceptor } = await import('./common/interceptors/logging.interceptor')
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Validation: whitelist elimina propiedades extra; forbidNonWhitelisted: false evita 400 por campos extra (ej. app móvil)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        logger.error('❌ ValidationPipe: Error de validación')
        logger.error(`❌ Validation errors: ${JSON.stringify(errors, null, 2)}`)
        const { BadRequestException } = require('@nestjs/common')
        const first = errors?.[0] as { property?: string; constraints?: Record<string, string> } | undefined
        const firstMsg =
          first?.constraints ? Object.values(first.constraints)[0] : first?.property
            ? `Campo ${first.property} inválido`
            : undefined
        return new BadRequestException({
          message: firstMsg || 'Error de validación',
          details: errors,
        })
      },
    })
  )

  configureCloudinary(logger)

  // CORS - Configurado para web y mobile
  const frontendUrl = process.env.FRONTEND_URL
  const wwwVariant =
    frontendUrl && !frontendUrl.includes('www.')
      ? frontendUrl.replace(/^(https?:\/\/)([^/]+)/, (_, protocol, host) =>
        `${protocol}www.${host}`
      )
      : null
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    frontendUrl,
    wwwVariant,
  ].filter(Boolean) as string[]

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) {
        logger.debug('✅ Request sin origin permitido (mobile app, Postman, etc.)')
        return callback(null, true)
      }

      // En desarrollo, permitir todo localhost (cualquier puerto: 3000, 3001, etc.)
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          logger.debug(`✅ Origin permitido (desarrollo): ${origin}`)
          return callback(null, true)
        }
      }

      // Permitir localhost con cualquier puerto (por si NODE_ENV no es development)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(origin)) {
        logger.debug(`✅ Origin permitido (localhost): ${origin}`)
        return callback(null, true)
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
