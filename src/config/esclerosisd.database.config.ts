import { registerAs } from '@nestjs/config';

export default registerAs('esclerosisdDatabase', () => ({
  type: 'postgres',
  host: process.env.ESCLEROSISD_DB_HOST || 'vps.yamboly.lat',
  port: parseInt(process.env.ESCLEROSISD_DB_PORT || '2026', 10),
  username: process.env.ESCLEROSISD_DB_USERNAME || 'postgres',
  password: process.env.ESCLEROSISD_DB_PASSWORD || 'b1ba23caf4f8a946950f',
  database: process.env.ESCLEROSISD_DB_NAME || 'esclerosisd',
  synchronize: true,
  autoLoadEntities: false,
}));
