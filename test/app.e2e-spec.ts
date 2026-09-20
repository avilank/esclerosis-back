import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppModule } from './../src/app.module';

config();

/**
 * E2E contra la base real. A diferencia del test anterior (que era el
 * boilerplate de Nest y esperaba `GET /` -> "Hello World!", una ruta que no
 * existe), esto verifica que la app arranca y que la API queda cerrada sin JWT.
 *
 * Si Postgres no esta disponible, la suite se salta con un aviso en vez de
 * fallar: `npm test` (tests unitarios y de integracion) no necesita base.
 */
async function postgresDisponible(): Promise<boolean> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'esclerosis_db',
    connectTimeoutMS: 3000,
  });
  try {
    await dataSource.initialize();
    await dataSource.destroy();
    return true;
  } catch {
    return false;
  }
}

describe('esclerosis-back (e2e)', () => {
  let app: INestApplication | undefined;
  let disponible = false;

  beforeAll(async () => {
    disponible = await postgresDisponible();
    if (!disponible) {
      console.warn(
        '[e2e] Postgres no disponible: se saltan los tests e2e. Revisá el .env.',
      );
      return;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  it('rechaza sin JWT los endpoints protegidos', async () => {
    if (!disponible || !app) return;
    await request(app.getHttpServer()).get('/api/usuarios').expect(401);
    await request(app.getHttpServer())
      .get('/api/historias-clinicas')
      .expect(401);
    await request(app.getHttpServer()).get('/api/diagnosticos').expect(401);
  });

  it('valida el body del login y no filtra si el email existe', async () => {
    if (!disponible || !app) return;
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'no-es-email', password: 'x' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'inexistente@demo.com', password: 'password123' })
      .expect(401);
  });

  it('el login del admin demo devuelve token y NO devuelve el hash', async () => {
    if (!disponible || !app) return;
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@esclerosis.com', password: 'password123' });

    // Si no se corrió `npm run seed` todavía, no hay usuario demo.
    if (res.status !== 200) return;

    const login = res.body as { token: string; user: { rol: string } };
    expect(login.token).toBeDefined();
    expect(login.user.rol).toBe('admin');
    expect(JSON.stringify(res.body)).not.toContain('$2b$');

    const usuarios = await request(app.getHttpServer())
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);

    // Regresión: GET /api/usuarios devolvía el hash bcrypt de cada usuario.
    expect(JSON.stringify(usuarios.body)).not.toContain('$2b$');
    for (const usuario of usuarios.body as Array<Record<string, unknown>>) {
      expect(usuario.password).toBeUndefined();
    }
  });
});
