/**
 * Nombres de rol tal como los siembra `database/seeds/usuarios.seed.ts`.
 * El JWT lleva el nombre del rol (no el id), asi que las comparaciones se
 * hacen normalizando a minusculas y sin acentos (hay data historica con
 * "medico" y "médico").
 */
export const ROL_ADMIN = 'admin';
export const ROL_MEDICO = 'medico';
export const ROL_PACIENTE = 'paciente';

export type RolName =
  | typeof ROL_ADMIN
  | typeof ROL_MEDICO
  | typeof ROL_PACIENTE;

/** `"Médico"` -> `"medico"`, para comparar roles sin depender de acentos/mayusculas. */
export function normalizeRol(rol?: string | null): string {
  return (rol ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
