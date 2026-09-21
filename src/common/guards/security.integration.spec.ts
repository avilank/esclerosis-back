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
  ROL_SECRETARIA,
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
import { CitasController } from 'src/modules/citas/controllers/citas.controller';
import { CitasService } from 'src/modules/citas/services/citas.service';
import { PacientesController } from 'src/modules/pacientes/pacientes.controller';
import { PacientesService } from 'src/modules/pacientes/pacientes.service';
import { MedicosController } from 'src/modules/medicos/medicos.controller';
import { MedicosService } from 'src/modules/medicos/medicos.service';

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

  // La cita 1 es del medico 9, paciente 5, y esta programada.
  const citasService = {
    create: jest.fn().mockResolvedValue({ idCita: 1 }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({
      idCita: 1,
      idMedico: 9,
      idPaciente: 5,
      estado: 'programada',
    }),
    update: jest.fn().mockResolvedValue({ idCita: 1 }),
    cambiarEstado: jest.fn().mockResolvedValue({ idCita: 1 }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
    hoy: jest.fn().mockReturnValue('2026-09-21'),
  };
  const pacientesService = {
    createConUsuario: jest.fn().mockResolvedValue({ idPaciente: 20 }),
    create: jest.fn().mockResolvedValue({ idPaciente: 20 }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ idPaciente: 20 }),
    update: jest.fn().mockResolvedValue({ idPaciente: 20 }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };
  const medicosService = {
    create: jest.fn().mockResolvedValue({ idMedico: 9 }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ idMedico: 9 }),
    update: jest.fn().mockResolvedValue({ idMedico: 9 }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
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
        CitasController,
        PacientesController,
        MedicosController,
      ],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: UsuariosService, useValue: usuariosService },
        { provide: HistoriasClinicasService, useValue: historiasService },
        { provide: TratamientosService, useValue: tratamientosService },
        { provide: DiagnosticosService, useValue: diagnosticosService },
        { provide: CitasService, useValue: citasService },
        { provide: PacientesService, useValue: pacientesService },
        { provide: MedicosService, useValue: medicosService },
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

    // Desde el módulo de citas, el médico firma a su propio nombre Y atendiendo
    // una cita suya (`idCita`); sin cita es 403 (ver «diagnostico ligado a cita»).
    it('un médico sí puede firmar a su propio nombre, con su cita -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({
          idhistoriaClinica: 1,
          idMedico: 9,
          idCita: 1,
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

  describe('citas: rol secretaria', () => {
    const nuevaCita = {
      idPaciente: 5,
      idMedico: 9,
      fechaCita: '2026-10-01',
      horaCita: '09:00',
      motivo: 'control',
    };

    it('la secretaria agenda una cita -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/citas')
        .set('Authorization', `Bearer ${token(ROL_SECRETARIA, 4)}`)
        .send(nuevaCita)
        .expect(201);
    });

    it('guarda al usuario del token como creador de la cita', async () => {
      citasService.create.mockClear();
      await request(app.getHttpServer())
        .post('/api/citas')
        .set('Authorization', `Bearer ${token(ROL_SECRETARIA, 4)}`)
        .send(nuevaCita)
        .expect(201);
      expect(citasService.create.mock.calls[0][1]).toBe(4);
    });

    it('un medico NO agenda citas -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/citas')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send(nuevaCita)
        .expect(403);
    });

    it('un paciente NO agenda citas -> 403', async () => {
      await request(app.getHttpServer())
        .post('/api/citas')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .send(nuevaCita)
        .expect(403);
    });

    it('hora con formato invalido -> 400', async () => {
      await request(app.getHttpServer())
        .post('/api/citas')
        .set('Authorization', `Bearer ${token(ROL_SECRETARIA, 4)}`)
        .send({ ...nuevaCita, horaCita: '9am' })
        .expect(400);
    });

    it('la secretaria da de alta un paciente completo -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/pacientes/con-usuario')
        .set('Authorization', `Bearer ${token(ROL_SECRETARIA, 4)}`)
        .send({
          username: 'nuevo_pac',
          email: 'nuevo@demo.com',
          password: 'password123',
          dniPaciente: '12345678',
          nombrePaciente: 'Nuevo Paciente',
          edadPaciente: 40,
          generoPaciente: 'Femenino',
          fechaNacimiento: '1986-05-04',
        })
        .expect(201);
    });

    it('la secretaria lee pacientes, medicos e historias -> 200', async () => {
      const t = `Bearer ${token(ROL_SECRETARIA, 4)}`;
      await request(app.getHttpServer())
        .get('/api/pacientes')
        .set('Authorization', t)
        .expect(200);
      await request(app.getHttpServer())
        .get('/api/medicos')
        .set('Authorization', t)
        .expect(200);
      await request(app.getHttpServer())
        .get('/api/historias-clinicas')
        .set('Authorization', t)
        .expect(200);
    });

    it('la secretaria NO entra a usuarios, diagnosticos ni catalogos -> 403', async () => {
      const t = `Bearer ${token(ROL_SECRETARIA, 4)}`;
      await request(app.getHttpServer())
        .post('/api/usuarios')
        .set('Authorization', t)
        .send({ username: 'x', email: 'x@d.com', password: 'password123' })
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', t)
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/tratamientos')
        .set('Authorization', t)
        .send({ nombre: 'x', descripcion: 'y' })
        .expect(403);
      await request(app.getHttpServer())
        .delete('/api/historias-clinicas/1')
        .set('Authorization', t)
        .expect(403);
      await request(app.getHttpServer())
        .post('/api/pacientes')
        .set('Authorization', t)
        .send({})
        .expect(403);
    });
  });

  describe('citas: medico y paciente', () => {
    it('el medico lista sus citas -> 200 y se fuerza su idMedico', async () => {
      citasService.findAll.mockClear();
      await request(app.getHttpServer())
        .get('/api/citas?idMedico=99')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .expect(200);
      // Ignora el idMedico de la query y usa el del token.
      expect(citasService.findAll.mock.calls[0][0]).toMatchObject({
        idMedico: 9,
      });
    });

    it('el paciente lista sus citas -> 200 y se fuerza su idPaciente', async () => {
      citasService.findAll.mockClear();
      await request(app.getHttpServer())
        .get('/api/citas?idPaciente=77')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .expect(200);
      expect(citasService.findAll.mock.calls[0][0]).toMatchObject({
        idPaciente: 5,
      });
    });

    it('el paciente 6 no abre la cita del paciente 5 -> 403', async () => {
      await request(app.getHttpServer())
        .get('/api/citas/1')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 6)}`)
        .expect(403);
    });

    it('el paciente 5 si abre su cita -> 200', async () => {
      await request(app.getHttpServer())
        .get('/api/citas/1')
        .set('Authorization', `Bearer ${token(ROL_PACIENTE, 5)}`)
        .expect(200);
    });

    it('el medico marca no_asistio en su cita -> 200', async () => {
      await request(app.getHttpServer())
        .patch('/api/citas/1/estado')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({ estado: 'no_asistio' })
        .expect(200);
    });

    it('el medico NO puede cancelar -> 403', async () => {
      await request(app.getHttpServer())
        .patch('/api/citas/1/estado')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({ estado: 'cancelada' })
        .expect(403);
    });

    it('no se puede setear "atendida" a mano -> 400', async () => {
      await request(app.getHttpServer())
        .patch('/api/citas/1/estado')
        .set('Authorization', `Bearer ${token(ROL_SECRETARIA, 4)}`)
        .send({ estado: 'atendida' })
        .expect(400);
    });

    it('el medico NO reprograma ni borra citas -> 403', async () => {
      const t = `Bearer ${token(ROL_MEDICO, 9)}`;
      await request(app.getHttpServer())
        .patch('/api/citas/1')
        .set('Authorization', t)
        .send({ fechaCita: '2026-10-02' })
        .expect(403);
      await request(app.getHttpServer())
        .delete('/api/citas/1')
        .set('Authorization', t)
        .expect(403);
    });
  });

  describe('diagnostico ligado a cita', () => {
    const base = {
      idhistoriaClinica: 1,
      idMedico: 9,
      fechaDiagnostico: '2026-09-21',
      estadoSalud: 'leve',
      gradoEnfermedad: 'RR',
    };

    it('el medico diagnostica CON idCita -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({ ...base, idCita: 1 })
        .expect(201);
    });

    it('el medico SIN idCita -> 403 (no hay diagnosticos huerfanos)', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send(base)
        .expect(403);
    });

    it('el admin sigue pudiendo diagnosticar sin cita -> 201', async () => {
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_ADMIN, 1)}`)
        .send(base)
        .expect(201);
    });

    it('idCita llega al servicio', async () => {
      diagnosticosService.create.mockClear();
      await request(app.getHttpServer())
        .post('/api/diagnosticos')
        .set('Authorization', `Bearer ${token(ROL_MEDICO, 9)}`)
        .send({ ...base, idCita: 1 })
        .expect(201);
      const dto = diagnosticosService.create.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(dto.idCita).toBe(1);
    });
  });
});
