import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, headers } = request
    const now = Date.now()

    // Log request
    this.logger.log(`📥 ${method} ${url}`)
    if (body && Object.keys(body).length > 0) {
      this.logger.log(`📥 Request body: ${JSON.stringify(body)}`)
    }
    if (headers.authorization) {
      this.logger.log(`📥 Authorization header: ${headers.authorization.substring(0, 20)}...`)
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response
        const delay = Date.now() - now
        this.logger.log(`📤 ${method} ${url} ${statusCode} - ${delay}ms`)
      }),
      catchError((error: unknown) => {
        const delay = Date.now() - now
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        const errorStack = error instanceof Error ? error.stack : undefined
        
        this.logger.error(`❌ ${method} ${url} - Error después de ${delay}ms`)
        this.logger.error(`❌ Error message: ${errorMessage}`)
        if (errorStack) {
          this.logger.error(`❌ Stack trace: ${errorStack}`)
        }
        
        return throwError(() => error)
      })
    )
  }
}

