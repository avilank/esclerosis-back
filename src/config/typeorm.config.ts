import { registerAs } from '@nestjs/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './database.config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port', 5432),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        dropSchema: false,
        logging: false,
        autoLoadEntities: true,
    }),
};
