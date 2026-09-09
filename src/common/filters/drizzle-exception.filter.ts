import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DrizzleError, DrizzleQueryError } from 'drizzle-orm';
import { Request, Response } from 'express';
import { DatabaseError } from 'pg';

type ErrorDetail = { status: HttpStatus; error: string; message: string };

const PG_ERROR_MAP: Record<string, ErrorDetail> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    error: 'Conflict',
    message: 'Record already exists',
  },
  '23503': {
    status: HttpStatus.NOT_FOUND,
    error: 'Not Found',
    message: 'Related resource not found',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: 'Required field is missing',
  },
  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    error: 'Bad Request',
    message: 'Invalid input format',
  },
};

const DEFAULT_DB_ERROR: ErrorDetail = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  error: 'Internal Server Error',
  message: 'Database error',
};

@Catch(DrizzleQueryError, DrizzleError, DatabaseError)
export class DrizzleExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DrizzleExceptionFilter.name);

  catch(
    exception: DrizzleError | DrizzleQueryError | DatabaseError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, error, message } = this.resolveErrorDetails(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack || String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${message}`,
      );
    }

    return response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveErrorDetails(
    exception: DrizzleError | DrizzleQueryError | DatabaseError,
  ): ErrorDetail {
    if (exception instanceof DrizzleQueryError) {
      const dbError = exception.cause;
      if (dbError instanceof DatabaseError) {
        return PG_ERROR_MAP[dbError.code ?? ''] ?? DEFAULT_DB_ERROR;
      }
      return DEFAULT_DB_ERROR;
    }

    if (exception instanceof DrizzleError) {
      const dbError = exception.cause;
      if (dbError instanceof DatabaseError) {
        return PG_ERROR_MAP[dbError.code ?? ''] ?? DEFAULT_DB_ERROR;
      }
      return DEFAULT_DB_ERROR;
    }

    return PG_ERROR_MAP[exception.code ?? ''] ?? DEFAULT_DB_ERROR;
  }
}
