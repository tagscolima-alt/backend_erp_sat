import {
  applyDecorators,
  UseInterceptors,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DataSource } from 'typeorm';

/**
 * Interceptor que registra automáticamente cada request
 * y su resultado (éxito o error) en la tabla logs_sistema.
 */
@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly origen: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    const baseLog = {
      ip: req.ip || req.connection?.remoteAddress || 'localhost',
      method: req.method,
      endpoint: req.originalUrl,
      body: req.body,
    };

    return new Observable((observer) => {
      next
        .handle()
        .pipe(
          tap(async (response) => {
            const duracion = Date.now() - start;
            try {
              await this.dataSource.query(
                `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
                 VALUES ($1, $2, $3, $4)`,
                [
                  this.origen,
                  baseLog.endpoint,
                  JSON.stringify({
                    ...baseLog,
                    status_code: 200,
                    duracion_ms: duracion,
                    respuesta: response,
                  }),
                  baseLog.ip,
                ],
              );
            } catch (err) {
              console.warn('⚠️ Error al guardar log automático:', err.message);
            }
          }),
          catchError(async (error) => {
            const duracion = Date.now() - start;
            try {
              await this.dataSource.query(
                `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
                 VALUES ($1, $2, $3, $4)`,
                [
                  this.origen,
                  baseLog.endpoint,
                  JSON.stringify({
                    ...baseLog,
                    status_code: error.status || 500,
                    duracion_ms: duracion,
                    error: error.message,
                  }),
                  baseLog.ip,
                ],
              );
            } catch (err) {
              console.warn('⚠️ Error al guardar log de error:', err.message);
            }
            throw error;
          }),
        )
        .subscribe(observer);
    });
  }
}

/**
 * Decorador para aplicar el interceptor fácilmente.
 * Ejemplo:  @RegistrarLog('SAT')
 */
export function RegistrarLog(origen = 'App'): MethodDecorator {
  return applyDecorators(UseInterceptors(LogInterceptor as any));
}
