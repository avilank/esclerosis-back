import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/** Metodos que modifican estado: se marcan en el log para la auditoria. */
const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Traza cada request con la identidad del usuario autenticado (id y rol), que
 * `JwtAuthGuard` deja en `request.user`. Antes solo se registraba
 * `metodo url ip status`, sin saber quien habia hecho el cambio.
 *
 * Nunca se loguea el body: llevaria contraseñas y datos clinicos a los logs.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const { method, ip, originalUrl } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const delay = Date.now() - now;
        const user = request.user;
        const actor = user
          ? `user=${user.id} rol=${user.rol || 'sin-rol'}`
          : 'user=anonimo';
        const audit = MUTATING_METHODS.has(method) ? ' [AUDIT]' : '';

        this.logger.log(
          `${method} ${originalUrl} ${actor} ip=${ip} ${response.statusCode} - ${delay}ms${audit}`,
        );
      }),
    );
  }
}
