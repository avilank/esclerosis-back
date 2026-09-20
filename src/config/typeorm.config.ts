import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { shouldSynchronize } from './database.config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port', 5432),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    synchronize: shouldSynchronize(),
    dropSchema: false,
    logging: false,
    autoLoadEntities: true,
    migrations: [__dirname + '/../database/migrations/*.ts'],
  }),
};
