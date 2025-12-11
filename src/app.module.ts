import { Module } from '@nestjs/common';
import { BaseModule } from './modules/base.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import esclerosisdDatabaseConfig from './config/esclerosisd.database.config';
import { jwtConfig, jwtConfigValues } from './config/jwt.config';
import { typeOrmConfig, esclerosisdTypeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfigValues, databaseConfig, esclerosisdDatabaseConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    TypeOrmModule.forRootAsync(esclerosisdTypeOrmConfig),
    JwtModule.registerAsync(jwtConfig),
    BaseModule,
  ],
  providers: [
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
export class AppModule { }
