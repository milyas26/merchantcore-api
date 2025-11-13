// Error handling utilities

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class ErrorHandler {
  // Common error types
  static readonly ERROR_TYPES = {
    // Validation errors (400)
    VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Validation failed', statusCode: 400 },
    INVALID_REQUEST: { code: 'INVALID_REQUEST', message: 'Invalid request', statusCode: 400 },
    MISSING_REQUIRED_FIELDS: { code: 'MISSING_REQUIRED_FIELDS', message: 'Missing required fields', statusCode: 400 },
    
    // Authentication errors (401)
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 },
    INVALID_TOKEN: { code: 'INVALID_TOKEN', message: 'Invalid token', statusCode: 401 },
    TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', message: 'Token expired', statusCode: 401 },
    
    // Authorization errors (403)
    FORBIDDEN: { code: 'FORBIDDEN', message: 'Forbidden', statusCode: 403 },
    INSUFFICIENT_PERMISSIONS: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Insufficient permissions', statusCode: 403 },
    
    // Not found errors (404)
    NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found', statusCode: 404 },
    PRODUCT_NOT_FOUND: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', statusCode: 404 },
    USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 },
    CATEGORY_NOT_FOUND: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found', statusCode: 404 },
    
    // Conflict errors (409)
    CONFLICT: { code: 'CONFLICT', message: 'Resource conflict', statusCode: 409 },
    DUPLICATE_RESOURCE: { code: 'DUPLICATE_RESOURCE', message: 'Duplicate resource', statusCode: 409 },
    
    // Server errors (500)
    INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', statusCode: 500 },
    DATABASE_ERROR: { code: 'DATABASE_ERROR', message: 'Database error', statusCode: 500 },
    SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable', statusCode: 503 },
  };

  // Create error response
  static createError(errorType: keyof typeof ErrorHandler.ERROR_TYPES, details?: any): AppError {
    const error = ErrorHandler.ERROR_TYPES[errorType];
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(details && { details })
    };
  }

  // Create validation error
  static validationError(message: string, details?: any): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message,
      statusCode: 400,
      ...(details && { details })
    };
  }

  // Create not found error
  static notFoundError(resource: string, id?: string): AppError {
    return {
      code: 'NOT_FOUND',
      message: id ? `${resource} with id ${id} not found` : `${resource} not found`,
      statusCode: 404
    };
  }

  // Create conflict error
  static conflictError(message: string, details?: any): AppError {
    return {
      code: 'CONFLICT',
      message,
      statusCode: 409,
      ...(details && { details })
    };
  }

  // Handle Prisma errors
  static handlePrismaError(error: any): AppError {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return {
        code: 'DUPLICATE_RESOURCE',
        message: 'Duplicate resource',
        statusCode: 409,
        details: error.meta
      };
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        statusCode: 404,
        details: error.meta
      };
    }

    if (error.code === 'P2003') {
      // Foreign key constraint violation
      return {
        code: 'INVALID_REQUEST',
        message: 'Invalid reference',
        statusCode: 400,
        details: error.meta
      };
    }

    // Default database error
    return {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      statusCode: 500,
      details: error.message
    };
  }

  // Handle unknown errors
  static handleUnknownError(error: any): AppError {
    if (error instanceof Error) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred',
        statusCode: 500,
        details: error.stack
      };
    }

    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      details: error
    };
  }
}

// Response utilities
export class ResponseHandler {
  // Success response
  static success<T>(data: T, message?: string, pagination?: any) {
    const response: any = {
      success: true,
      ...(message && { message }),
      data
    };
    
    if (pagination) {
      response.pagination = pagination;
    }
    
    return response;
  }

  // Error response
  static error(error: AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      }
    };
  }

  // Paginated response
  static paginated<T>(data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }) {
    return {
      success: true,
      data,
      pagination
    };
  }
}