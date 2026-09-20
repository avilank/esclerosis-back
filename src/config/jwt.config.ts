import { registerAs } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const FALLBACK_DEV_SECRET = 'esclerosis_dev_secret_no_usar_en_produccion';

/**
 * Resuelve el secreto de firma del JWT. En produccion se exige `JWT_SECRET`
 * explicito: un secreto por defecto permitiria a cualquiera forjar tokens
 * validos (incluyendo uno con `rol: "admin"`).
 */
function resolveSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET no está definido. Es obligatorio en producción (ver .env.example).',
    );
  }
  Logger.warn(
    'JWT_SECRET no definido: usando un secreto de desarrollo. Definilo en .env antes de desplegar.',
    'JwtConfig',
  );
  return FALLBACK_DEV_SECRET;
}

export const jwtConfigValues = registerAs('jwt', () => ({
  secret: resolveSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));

export const jwtConfig: JwtModuleAsyncOptions = {
  global: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('jwt.secret'),
    signOptions: {
      expiresIn: configService.get<string>(
        'jwt.expiresIn',
        '24h',
      ) as JwtSignOptions['expiresIn'],
    },
  }),
};
