import { Module } from '@nestjs/common';
import { BaseModule } from './modules/base.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { jwtConfig, jwtConfigValues } from './config/jwt.config';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfigValues, databaseConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    JwtModule.registerAsync(jwtConfig),
    BaseModule,
  ],
})
export class AppModule { }
