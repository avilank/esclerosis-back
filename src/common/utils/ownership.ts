import { ForbiddenException } from '@nestjs/common';
import {
  normalizeRol,
  ROL_MEDICO,
  ROL_PACIENTE,
} from '../constants/roles.constant';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Evita IDOR en los endpoints parametrizados por id de paciente/medico: el rol
 * indicado solo puede consultar SU propio id. Admin (y los demas roles
 * permitidos por `@Roles`) pasan sin restriccion.
 *
 * `idPaciente` e `idMedico` comparten valor con `idUsuario` (ver
 * `UsuariosService.create`), por eso se comparan contra `user.id`.
 */
function assertOwnId(user: JwtPayload, rol: string, targetId: number) {
  if (normalizeRol(user?.rol) !== normalizeRol(rol)) return;
  if (user.id !== targetId) {
    throw new ForbiddenException('Solo puedes consultar tu propia información');
  }
}

/** Un paciente solo puede pedir datos de su propio `idPaciente`. */
export function assertPacienteOwnsId(user: JwtPayload, idPaciente: number) {
  assertOwnId(user, ROL_PACIENTE, idPaciente);
}

/** Un medico solo puede pedir datos de su propio `idMedico`. */
export function assertMedicoOwnsId(user: JwtPayload, idMedico: number) {
  assertOwnId(user, ROL_MEDICO, idMedico);
}

/** `true` si el usuario del token es un paciente. */
export function isPaciente(user?: JwtPayload): boolean {
  return normalizeRol(user?.rol) === ROL_PACIENTE;
}
