import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_PACIENTE,
} from '../constants/roles.constant';
import { UsuariosController } from 'src/modules/usuarios/controllers/usuarios.controller';
import { UsuariosService } from 'src/modules/usuarios/services/usuarios.service';
import { HistoriasClinicasController } from 'src/modules/historias-clinicas/historias-clinicas.controller';
import { HistoriasClinicasService } from 'src/modules/historias-clinicas/historias-clinicas.service';
import { TratamientosController } from 'src/modules/tratamientos/controllers/tratamientos.controller';
import { TratamientosService } from 'src/modules/tratamientos/services/tratamientos.service';
import { AuthController } from 'src/modules/auth/authentication/controllers/authentication.controller';
import { AuthService } from 'src/modules/auth/authentication/services/authentication.service';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { DiagnosticosController } from 'src/modules/diagnosticos/controllers/diagnosticos.controller';
import { DiagnosticosService } from 'src/modules/diagnosticos/services/diagnosticos.service';

const SECRET = 'test_secret_integration';

/**
 * Levanta la app real (routing + guards globales + ValidationPipe) con los
 * servicios mockeados, para verificar la capa de seguridad sin necesitar
 * Postgres.
 */
describe('Capa de seguridad (integración HTTP)', () => {
  let app: INestApplication;
  let jwt: JwtService;

  const usuariosService = {
    create: jest.fn().mockResolvedValue({ idUsuario: 1 }),
    createUsuario: jest.fn().mockResolvedValue({ idUsuario: 1 }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ idUsuario: 1 }),
    update: jest.fn().mockResolvedValue({ idUsuario: 1 }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const historiasService = {
    findAll: jest.fn().mockResolvedValue([]),
    findByPaciente: jest.fn().mockResolvedValue({ idHistoriaClinica: 1 }),
    findMedicoHistoriaClinica: jest.fn().mockResolvedValue([]),
    searchByMedico: jest.fn().mockResolvedValue([]),
    search: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ idHistoriaClinica: 1 }),
    create: jest.fn().mockResolvedValue({ idHistoriaClinica: 1 }),
    update: jest.fn().mockResolvedValue({ idHistoriaClinica: 1 }),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  const tratamientosService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ idTratamiento: 1 }),
    create: jest.fn().mockResolvedValue({ idTratamiento: 1 }),
    update: jest.fn().mockResolvedValue({ idTratamiento: 1 }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const authService = {
    login: jest.fn().mockResolvedValue({ token: 'x', user: {} }),
    register: jest.fn().mockResolvedValue({ token: 'x', user: {} }),
  };
  // El diagnóstico 1 pertenece al médico 9 y al paciente 5.
  const diagnosticosService = {
    create: jest.fn().mockResolvedValue({ idDiagnostico: 1 }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({
      idDiagnostico: 1,
      idMedico: 9,
      historiaClinica: { idHistoriaClinica: 1, idPaciente: 5 },
    }),
    findByHistoriaClinica: jest.fn().mockResolvedValue([]),
    findByMedico: jest.fn().mockResolvedValue([]),
    getStatsByMedico: jest.fn().mockResolvedValue({ criticos: 0 }),
    getStatsByPaciente: jest.fn().mockResolvedValue({ totalDiagnosticos: 0 }),
    update: jest.fn().mockResolvedValue({ idDiagnostico: 1 }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const token = (rol: string, id = 1) =>
    jwt.sign({ id, email: 'a@b.com', username: 'u', rol });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: SECRET })],
      controllers: [
        AuthController,
        UsuariosController,
        HistoriasClinicasController,
        TratamientosController,
        DiagnosticosController,
      ],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: UsuariosService, useValue: usuariosService },
        { provide: HistoriasClinicasService, useValue: historiasService },
        { provide: TratamientosService, useValue: tratamientosService },
        { provide: DiagnosticosService, useValue: diagnosticosService },
        { provide: AuthService, useValue: authService },
        { provide: getRepositoryToken(Usuario), useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('autenticación', () => {
    it('GET /api/usuarios sin token -> 401', async () => {
      await request(app.getHttpServer()).get('/api/usuarios').expect(401);
    });

    it('GET /api/usuarios con token basura -> 401', async () => {
      await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', 'Bearer no-es-un-jwt')
        .expect(401);
    });

    it('POST /api/auth/login es público -> 200', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@esclerosis.com', password: 'password123' })
        .expect(200);
    });
  });

  describe('autorización por rol', () => {
    it('un paciente no entra al módulo de usuarios -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE)}`)
        .expect(403);
    });

    it('un médico no entra al módulo de usuarios -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token(ROL_MEDICO)}`)
        .expect(403);
    });

    it('el admin sí entra -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token(ROL_ADMIN)}`)
        .expect(200);
    });

    it('un médico puede LEER el catálogo de tratamientos -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/tratamientos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO)}`)
        .expect(200);
    });

    it('un médico NO puede borrar un tratamiento -> 403', async () => {
      await request(app.getHttpServer())
        .delete('/api/tratamientos/1')
        .set('Authorization', `Bearer ${token(ROL_MEDICO)}`)
        .expect(403);
    });

    it('un paciente no puede listar todas las historias clínicas -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE)}`)
        .expect(403);
    });
  });

  describe('pertenencia (IDOR)', () => {
    it('el paciente 5 no puede leer la historia del paciente 6 -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas/paciente/6')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .expect(403);
    });

    it('el paciente 5 sí puede leer la suya -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas/paciente/5')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .expect(200);
    });

    it('el médico 9 no puede pedir los pacientes del médico 10 -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas/medico/10')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .expect(403);
    });

    it('el admin puede consultar la historia de cualquier paciente -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas/paciente/6')
        .set('Authorization', `Bearer ${token(ROL_ADMIN, 1)}`)
        .expect(200);
    });

    it('el paciente 5 puede abrir su diagnóstico -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/diagnosticos/1')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .expect(200);
    });

    it('el paciente 6 no puede abrir el diagnóstico del paciente 5 -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/diagnosticos/1')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 6)}`)
        .expect(403);
    });

    it('un médico no puede firmar un diagnóstico a nombre de otro -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({
          idhistoriaClinica: 1,
          idMedico: 10,
          fechaDiagnostico: '2026-01-15',
          estadoSalud: 'leve',
          gradoEnfermedad: 'RR',
        })
        .expect(403);
    });

    it('un médico sí puede firmar a su propio nombre -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({
          idhistoriaClinica: 1,
          idMedico: 9,
          fechaDiagnostico: '2026-01-15',
          estadoSalud: 'leve',
          gradoEnfermedad: 'RR',
        })
        .expect(201);
    });

    it('el médico 10 no puede borrar un diagnóstico del médico 9 -> 403', async () => {
      await request(app.getHttpServer())
        .delete('/api/diagnosticos/1')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 10)}`)
        .expect(403);
    });
  });

  describe('validación de entrada', () => {
    it('login con email inválido -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'no-es-un-email', password: 'password123' })
        .expect(400);
    });

    it('login sin password -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@esclerosis.com' })
        .expect(400);
    });

    it('registro con contraseña débil -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'nuevo', email: 'n@demo.com', password: 'abc' })
        .expect(400);
    });

    it('crear usuario con email inválido -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token(ROL_ADMIN)}`)
        .send({ username: 'x', email: 'malo', password: 'password123' })
        .expect(400);
    });

    it('id no numérico en la ruta -> 400', async () => {
      await request(app.getHttpServer())
        .get('/api/historias-clinicas/paciente/abc')
        .set('Authorization', `Bearer ${token(ROL_ADMIN)}`)
        .expect(400);
    });

    it('whitelist descarta propiedades no declaradas en el DTO', async () => {
      tratamientosService.create.mockClear();
      await request(app.getHttpServer())
        .post('/api/tratamientos')
        .set('Authorization', `Bearer ${token(ROL_ADMIN)}`)
        .send({
          nombre: 'Natalizumab',
          descripcion: 'DMT de alta eficacia',
          idTratamiento: 999, // intento de fijar el PK a mano
          campoInventado: 'x',
        })
        .expect(201);

      const llamadas = tratamientosService.create.mock.calls as Array<
        [Record<string, unknown>]
      >;
      const recibido = llamadas[0][0];
      expect(recibido).toEqual({
        nombre: 'Natalizumab',
        descripcion: 'DMT de alta eficacia',
      });
      expect(recibido).not.toHaveProperty('idTratamiento');
      expect(recibido).not.toHaveProperty('campoInventado');
    });
  });
});
