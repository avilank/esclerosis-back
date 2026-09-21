import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_SECRETARIA,
} from '../constants/roles.constant';
import { assertMedicoOwnsId, assertPacienteOwnsId } from '../utils/ownership';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

type MetadataMap = Record<string, unknown>;

/** Reflector falso: devuelve la metadata que le pasemos por test. */
function fakeReflector(metadata: MetadataMap): Reflector {
  return {
    getAllAndOverride: (key: string) => metadata[key],
  } as unknown as Reflector;
}

function fakeContext(request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const secret = 'test_secret';
  const jwtService = new JwtService({ secret });

  it('deja pasar los endpoints marcados con @Public() sin token', async () => {
    const guard = new JwtAuthGuard(
      jwtService,
      fakeReflector({ [IS_PUBLIC_KEY]: true }),
    );
    await expect(guard.canActivate(fakeContext({ headers: {} }))).resolves.toBe(
      true,
    );
  });

  it('rechaza un request sin header Authorization', async () => {
    const guard = new JwtAuthGuard(jwtService, fakeReflector({}));
    await expect(
      guard.canActivate(fakeContext({ headers: {} })),
    ).rejects.toThrow('Falta el token de autenticación');
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const forged = new JwtService({ secret: 'otro_secreto' }).sign({
      id: 1,
      rol: ROL_ADMIN,
    });
    const guard = new JwtAuthGuard(jwtService, fakeReflector({}));
    await expect(
      guard.canActivate(
        fakeContext({ headers: { authorization: `Bearer ${forged}` } }),
      ),
    ).rejects.toThrow('Token inválido o expirado');
  });

  it('rechaza un token expirado', async () => {
    const expired = jwtService.sign(
      { id: 1, rol: ROL_ADMIN },
      { expiresIn: '-1s' },
    );
    const guard = new JwtAuthGuard(jwtService, fakeReflector({}));
    await expect(
      guard.canActivate(
        fakeContext({ headers: { authorization: `Bearer ${expired}` } }),
      ),
    ).rejects.toThrow('Token inválido o expirado');
  });

  it('acepta un token válido y expone el payload en request.user', async () => {
    const token = jwtService.sign({
      id: 7,
      email: 'dr@demo.com',
      username: 'dr_demo',
      rol: ROL_MEDICO,
    });
    const request: Record<string, unknown> = {
      headers: { authorization: `Bearer ${token}` },
    };
    const guard = new JwtAuthGuard(jwtService, fakeReflector({}));

    await expect(guard.canActivate(fakeContext(request))).resolves.toBe(true);
    expect((request.user as JwtPayload).id).toBe(7);
    expect((request.user as JwtPayload).rol).toBe(ROL_MEDICO);
  });
});

describe('RolesGuard', () => {
  it('permite cuando el handler no declara @Roles()', () => {
    const guard = new RolesGuard(fakeReflector({}));
    expect(
      guard.canActivate(fakeContext({ user: { id: 1, rol: 'paciente' } })),
    ).toBe(true);
  });

  it('bloquea a un paciente en un endpoint de admin', () => {
    const guard = new RolesGuard(fakeReflector({ [ROLES_KEY]: [ROL_ADMIN] }));
    expect(() =>
      guard.canActivate(fakeContext({ user: { id: 1, rol: 'paciente' } })),
    ).toThrow(ForbiddenException);
  });

  it('permite al admin en un endpoint de admin', () => {
    const guard = new RolesGuard(fakeReflector({ [ROLES_KEY]: [ROL_ADMIN] }));
    expect(
      guard.canActivate(fakeContext({ user: { id: 1, rol: ROL_ADMIN } })),
    ).toBe(true);
  });

  it('acepta "Médico" con acento y mayúscula como rol medico', () => {
    const guard = new RolesGuard(fakeReflector({ [ROLES_KEY]: [ROL_MEDICO] }));
    expect(
      guard.canActivate(fakeContext({ user: { id: 1, rol: 'Médico' } })),
    ).toBe(true);
  });

  it('la secretaria pasa un endpoint de @Roles(ROL_SECRETARIA)', () => {
    const guard = new RolesGuard(
      fakeReflector({ [ROLES_KEY]: [ROL_ADMIN, ROL_SECRETARIA] }),
    );
    expect(
      guard.canActivate(fakeContext({ user: { id: 1, rol: ROL_SECRETARIA } })),
    ).toBe(true);
  });

  it('la secretaria NO pasa un endpoint admin-only', () => {
    const guard = new RolesGuard(fakeReflector({ [ROLES_KEY]: [ROL_ADMIN] }));
    expect(() =>
      guard.canActivate(fakeContext({ user: { id: 1, rol: ROL_SECRETARIA } })),
    ).toThrow(ForbiddenException);
  });

  it('bloquea cuando no hay usuario en el request', () => {
    const guard = new RolesGuard(fakeReflector({ [ROLES_KEY]: [ROL_ADMIN] }));
    expect(() => guard.canActivate(fakeContext({}))).toThrow(
      ForbiddenException,
    );
  });
});

describe('chequeos de pertenencia (anti-IDOR)', () => {
  const paciente: JwtPayload = {
    id: 5,
    email: 'p@demo.com',
    username: 'paciente_demo',
    rol: 'paciente',
  };
  const medico: JwtPayload = {
    id: 9,
    email: 'dr@demo.com',
    username: 'dr_demo',
    rol: 'medico',
  };
  const admin: JwtPayload = {
    id: 1,
    email: 'a@demo.com',
    username: 'admin',
    rol: ROL_ADMIN,
  };

  it('un paciente no puede pedir la historia de otro paciente', () => {
    expect(() => assertPacienteOwnsId(paciente, 6)).toThrow(ForbiddenException);
  });

  it('un paciente sí puede pedir su propia historia', () => {
    expect(() => assertPacienteOwnsId(paciente, 5)).not.toThrow();
  });

  it('un médico no puede listar los diagnósticos de otro médico', () => {
    expect(() => assertMedicoOwnsId(medico, 10)).toThrow(ForbiddenException);
  });

  it('un médico sí puede listar los suyos', () => {
    expect(() => assertMedicoOwnsId(medico, 9)).not.toThrow();
  });

  it('el admin no queda restringido por id', () => {
    expect(() => assertPacienteOwnsId(admin, 99)).not.toThrow();
    expect(() => assertMedicoOwnsId(admin, 99)).not.toThrow();
  });
});
