import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { normalizeRol, RolName } from '../constants/roles.constant';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Guard global de autorizacion. Corre despues de `JwtAuthGuard` y valida el
 * `@Roles(...)` del handler (o del controller). Sin `@Roles(...)` alcanza con
 * estar autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<RolName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const rol = normalizeRol(request.user?.rol);

    if (!required.some((allowed) => normalizeRol(allowed) === rol)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso',
      );
    }
    return true;
  }
}
