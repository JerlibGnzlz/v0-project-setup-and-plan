import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ErrorResponse } from '../dto/api-response.dto';

/**
 * Filtro global de excepciones HTTP
 * 
 * Captura todas las excepciones y las formatea de manera consistente
 * 
 * Beneficios:
 * - Respuestas de error consistentes en toda la API
 * - Logging centralizado de errores
 * - Ocultación de detalles sensibles en producción
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error = 'Internal Server Error';
    let details: any = undefined;

    // Manejar ThrottlerException (Rate Limiting)
    if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Demasiadas solicitudes. Por favor, intenta nuevamente más tarde.';
      error = 'Too Many Requests';
      details = {
        retryAfter: 'Por favor espera unos momentos antes de intentar nuevamente',
        message: 'Has excedido el límite de solicitudes permitidas. Esto ayuda a proteger el sistema contra abuso.',
      };
    }
    // Manejar HttpException (errores controlados de NestJS)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || this.getErrorName(status);
        details = responseObj.details;

        // Si message es un array (validación), formatearlo
        if (Array.isArray(message)) {
          details = { validationErrors: message };
          message = 'Error de validación';
        }
      }
    }
    // Manejar errores de Prisma
    else if (this.isPrismaError(exception)) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = prismaError.error;
    }
    // Manejar errores genéricos
    else if (exception instanceof Error) {
      message = exception.message;
      
      // En producción, no exponer detalles del error
      if (process.env.NODE_ENV === 'production') {
        message = 'Error interno del servidor';
      }
    }

    // Logging del error
    this.logError(exception, request, status);

    // Crear respuesta de error estandarizada
    const errorResponse = new ErrorResponse(message, status, error, details);

    response.status(status).json(errorResponse);
  }

  /**
   * Determina si es un error de Prisma
   */
  private isPrismaError(exception: unknown): boolean {
    return (
      exception !== null &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }

  /**
   * Maneja errores específicos de Prisma
   */
  private handlePrismaError(exception: any): {
    status: number;
    message: string;
    error: string;
  } {
    const code = exception.code;

    switch (code) {
      case 'P2002':
        // Unique constraint violation
        // Intentar extraer información más específica del error
        const meta = exception.meta as any;
        let message = 'Ya existe un registro con estos datos';
        
        // Si el error menciona email, hacer el mensaje más específico
        if (meta?.target && Array.isArray(meta.target)) {
          const targetFields = meta.target as string[];
          if (targetFields.includes('email')) {
            message = 'Ya existe un pastor con este correo electrónico';
          } else if (targetFields.length > 0) {
            message = `Ya existe un registro con este ${targetFields.join(', ')}`;
          }
        }
        
        return {
          status: HttpStatus.CONFLICT,
          message,
          error: 'Conflict',
        };

      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registro no encontrado',
          error: 'Not Found',
        };

      case 'P2003':
        // Foreign key constraint
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Error de referencia: el registro relacionado no existe',
          error: 'Bad Request',
        };

      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'La relación requerida no existe',
          error: 'Bad Request',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error de base de datos',
          error: 'Internal Server Error',
        };
    }
  }

  /**
   * Obtiene el nombre del error según el código HTTP
   */
  private getErrorName(status: number): string {
    const statusNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    return statusNames[status] || 'Error';
  }

  /**
   * Registra el error en los logs
   */
  private logError(exception: unknown, request: Request, status: number): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      ...(exception instanceof Error && {
        message: exception.message,
        stack: exception.stack,
      }),
    };

    if (status >= 500) {
      this.logger.error('Server Error', JSON.stringify(errorLog, null, 2));
    } else if (status >= 400) {
      this.logger.warn('Client Error', JSON.stringify(errorLog, null, 2));
    }
  }
}


