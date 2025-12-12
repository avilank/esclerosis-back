import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  // Configurar CORS para permitir solicitudes desde la app móvil
  app.enableCors({
    origin: true, // Permitir todos los orígenes en desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const port = process.env.PORT ?? 3000;
  // Escuchar en todas las interfaces (0.0.0.0) para que sea accesible desde la red local
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://0.0.0.0:${port}! 🚀`);
  console.log(`Server accessible at http://localhost:${port} and http://192.168.1.51:${port}`);
}
bootstrap();
