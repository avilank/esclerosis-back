import { SetMetadata } from '@nestjs/common';
import { RolName } from '../constants/roles.constant';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint (o un controller completo) a los roles indicados.
 * Sin este decorador, basta con estar autenticado.
 */
export const Roles = (...roles: RolName[]) => SetMetadata(ROLES_KEY, roles);
