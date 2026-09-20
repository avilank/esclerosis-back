import { Module } from '@nestjs/common';
import { BaseModule } from './modules/base.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import openrouterConfig from './config/openrouter.config';
import { jwtConfig, jwtConfigValues } from './config/jwt.config';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ScheduledTasksModule } from './modules/scheduled-tasks/scheduled-tasks.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfigValues, databaseConfig, openrouterConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    JwtModule.registerAsync(jwtConfig),
    BaseModule,
    ScheduledTasksModule,
  ],
  providers: [
    // Orden importante: primero se autentica (rellena request.user) y despues
    // se autoriza con los @Roles(...) del handler.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
