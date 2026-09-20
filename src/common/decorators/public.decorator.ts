import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como accesible sin JWT. `JwtAuthGuard` esta registrado
 * como guard global, asi que TODO endpoint pide token salvo los que lleven
 * este decorador (login y registro).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
