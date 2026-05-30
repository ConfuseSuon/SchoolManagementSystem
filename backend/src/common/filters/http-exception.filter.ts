import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      const rawMsg = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse.message || 'Error occurred');

      if (Array.isArray(rawMsg)) {
        this.logger.warn(`Validation failure details: ${rawMsg.join(', ')}`);
        message = 'Invalid request data. Please check your input and try again.';
      } else {
        message = String(rawMsg);
      }

      if (status >= 400 && status < 500) {
        this.logger.warn(`[${status}] ${message}`);
      } else {
        this.logger.error(`[${status}] ${message}`, exception.stack);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(err.message, err.stack);
    }

    response.status(status).json({
      data: null,
      message,
    });
  }
}

