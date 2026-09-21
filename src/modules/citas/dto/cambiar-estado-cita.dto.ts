import { IsIn, IsNotEmpty } from 'class-validator';

/**
 * Estados que se pueden setear a mano. `atendida` NO está: la marca
 * `DiagnosticosService.create` al registrar el diagnóstico de la cita.
 */
export const ESTADOS_MANUALES = ['cancelada', 'no_asistio'] as const;

export type EstadoManualCita = (typeof ESTADOS_MANUALES)[number];

export class CambiarEstadoCitaDto {
  @IsNotEmpty()
  @IsIn(ESTADOS_MANUALES, {
    message: `estado debe ser uno de: ${ESTADOS_MANUALES.join(', ')}`,
  })
  estado: EstadoManualCita;
}
