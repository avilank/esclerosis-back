import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Origenes permitidos por CORS. La app Flutter no manda header `Origin`, asi
 * que CORS solo aplica a clientes web: si `CORS_ORIGINS` esta definido se usa
 * esa lista blanca; si no, se refleja el origen (comodo en desarrollo).
 */
function resolveCorsOrigin(): string[] | boolean {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return true;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Los DTOs ya tenian decoradores de class-validator pero no se ejecutaban
  // porque faltaba registrar el pipe. `whitelist` ademas descarta propiedades
  // no declaradas en el DTO (evita mass assignment sobre las entidades).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  );

  app.enableCors({
    origin: resolveCorsOrigin(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  // 0.0.0.0 para que sea accesible desde el emulador y desde la red local.
  await app.listen(port, '0.0.0.0');
  Logger.log(`Server is running on http://0.0.0.0:${port}`, 'Bootstrap');
}
void bootstrap();
