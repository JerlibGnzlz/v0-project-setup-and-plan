/**
 * DTOs de respuesta estandarizados para la API
 * 
 * Proveen una estructura consistente para todas las respuestas
 * Facilitan el manejo de errores y datos en el frontend
 */

/**
 * Respuesta exitosa genérica
 */
export class ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message);
  }
}

/**
 * Respuesta de lista con paginación
 */
export class PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;

  constructor(data: T[], meta: PaginationMeta) {
    this.success = true;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Metadatos de paginación
 */
export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

/**
 * Respuesta de error
 */
export class ErrorResponse {
  success: boolean;
  error: ErrorDetail;
  timestamp: string;

  constructor(
    message: string,
    statusCode: number,
    error?: string,
    details?: any
  ) {
    this.success = false;
    this.error = {
      message,
      statusCode,
      error: error || 'Error',
      details,
    };
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Detalle del error
 */
export interface ErrorDetail {
  message: string;
  statusCode: number;
  error: string;
  details?: any;
}

/**
 * Respuesta de creación exitosa
 */
export class CreatedResponse<T> extends ApiResponse<T> {
  constructor(data: T, entityName: string) {
    super(data, `${entityName} creado exitosamente`);
  }
}

/**
 * Respuesta de actualización exitosa
 */
export class UpdatedResponse<T> extends ApiResponse<T> {
  constructor(data: T, entityName: string) {
    super(data, `${entityName} actualizado exitosamente`);
  }
}

/**
 * Respuesta de eliminación exitosa
 */
export class DeletedResponse<T> extends ApiResponse<T> {
  constructor(data: T, entityName: string) {
    super(data, `${entityName} eliminado exitosamente`);
  }
}

/**
 * Respuesta vacía (para operaciones sin retorno)
 */
export class EmptyResponse {
  success: boolean;
  message: string;
  timestamp: string;

  constructor(message: string = 'Operación completada') {
    this.success = true;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Respuesta de validación fallida
 */
export class ValidationErrorResponse extends ErrorResponse {
  constructor(errors: ValidationError[]) {
    super(
      'Error de validación',
      400,
      'Bad Request',
      { validationErrors: errors }
    );
  }
}

/**
 * Error de validación individual
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Helper para crear respuestas
 */
export const ApiResponses = {
  ok: <T>(data: T, message?: string) => new ApiResponse(data, message),
  created: <T>(data: T, entityName: string) => new CreatedResponse(data, entityName),
  updated: <T>(data: T, entityName: string) => new UpdatedResponse(data, entityName),
  deleted: <T>(data: T, entityName: string) => new DeletedResponse(data, entityName),
  empty: (message?: string) => new EmptyResponse(message),
  error: (message: string, statusCode: number, error?: string, details?: any) =>
    new ErrorResponse(message, statusCode, error, details),
  validationError: (errors: ValidationError[]) => new ValidationErrorResponse(errors),
  paginated: <T>(data: T[], total: number, page: number, limit: number) =>
    new PaginatedResponse(data, new PaginationMeta(total, page, limit)),
};


