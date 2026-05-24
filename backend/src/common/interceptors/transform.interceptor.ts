import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // Prevent double wrapping
        if (data && typeof data === 'object' && 'data' in data && 'message' in data) {
          return data as Response<T>;
        }
        
        return {
          data: data !== undefined ? data : null,
          message: 'Success',
        };
      }),
    );
  }
}
