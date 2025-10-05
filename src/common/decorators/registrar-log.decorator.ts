import {
  applyDecorators,
  UseInterceptors,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * ✅ Fábrica dinámica de interceptor con inyección del DataSource
 */
export function LogInterceptorFactory(origen = 'App') {
  @Injectable()
  class LogInterceptorClass implements NestInterceptor {
    constructor(public readonly dataSource: DataSource) {} // 👈 public, no private

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const infoBase = {
        ip: req.ip || 'localhost',
        method: req.method,
        url: req.originalUrl,
        body: req.body,
      };
      const start = Date.now();

      return next.handle().pipe(
        tap(async (response) => {
          try {
            await this.dataSource.query(
              `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
               VALUES ($1, $2, $3, $4)`,
              [
                origen,
                req.route?.path || 'auto', // 👈 guarda el endpoint real
                JSON.stringify({
                  ...infoBase,
                  respuesta: response,
                  duracion_ms: Date.now() - start,
                }),
                infoBase.ip,
              ],
            );
          } catch (e) {
            console.warn('⚠️ Error al guardar log:', e.message);
          }
        }),
        catchError(async (error) => {
          try {
            await this.dataSource.query(
              `INSERT INTO logs_sistema (origen, accion, detalles, ip_cliente)
               VALUES ($1, $2, $3, $4)`,
              [
                origen,
                req.route?.path || 'auto_error',
                JSON.stringify({
                  ...infoBase,
                  error: error.message,
                  duracion_ms: Date.now() - start,
                }),
                infoBase.ip,
              ],
            );
          } catch (e) {
            console.warn('⚠️ Error al guardar log de error:', e.message);
          }
          throw error;
        }),
      );
    }
  }

  return mixin(LogInterceptorClass);
}

/**
 * ✅ Decorador listo para aplicar en endpoints
 */
export function RegistrarLog(origen = 'App'): MethodDecorator {
  return applyDecorators(UseInterceptors(LogInterceptorFactory(origen)));
}
