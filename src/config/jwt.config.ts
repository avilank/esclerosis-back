import { registerAs } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfigValues = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'my_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));

export const jwtConfig: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('jwt.secret'),
    signOptions: {
      expiresIn: configService.get('jwt.expiresIn', '24h'),
    },
    global: true,
  }),
};
