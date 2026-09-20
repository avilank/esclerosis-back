import { registerAs } from '@nestjs/config';

/**
 * Data warehouse (analytics). Sin credenciales por defecto a proposito: antes
 * este archivo traia hardcodeados el host y la password de un Postgres remoto,
 * con lo cual cualquiera que clonara el repo sin `.env` se conectaba (y con
 * `synchronize` activo, alteraba) esa base.
 */
export default registerAs('esclerosisdDatabase', () => ({
  type: 'postgres',
  host: process.env.ESCLEROSISD_DB_HOST || 'localhost',
  port: parseInt(process.env.ESCLEROSISD_DB_PORT || '5432', 10),
  username: process.env.ESCLEROSISD_DB_USERNAME || 'postgres',
  password: process.env.ESCLEROSISD_DB_PASSWORD || '',
  database: process.env.ESCLEROSISD_DB_NAME || 'esclerosisd',
  autoLoadEntities: false,
}));
