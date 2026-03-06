import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'

const ALLOWED_KEYS = [
  'tipo',
  'dni',
  'nombre',
  'apellido',
  'nacionalidad',
  'tipoPastor',
  'fechaNacimiento',
  'motivo',
] as const

/**
 * Interceptor que deja en req.body solo las propiedades permitidas por CreateSolicitudCredencialDto.
 * Evita 400 por forbidNonWhitelisted cuando la app móvil o un proxy envían propiedades extra.
 */
@Injectable()
export class SanitizeSolicitudBodyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SanitizeSolicitudBodyInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const body = request.body

    this.logger.log(
      `[solicitudes] Body recibido (keys): ${body && typeof body === 'object' ? Object.keys(body).join(', ') : typeof body}`
    )
    this.logger.log(
      `[solicitudes] Body recibido (raw): ${JSON.stringify(body)}`
    )

    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const sanitized: Record<string, unknown> = {}
      for (const key of ALLOWED_KEYS) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          const v = body[key]
          if (v !== undefined && v !== null) sanitized[key] = v
        }
      }
      request.body = sanitized
      this.logger.log(
        `[solicitudes] Body sanitizado: ${JSON.stringify(sanitized)}`
      )
    }

    return next.handle()
  }
}
