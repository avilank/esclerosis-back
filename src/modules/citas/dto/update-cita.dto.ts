import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaDto } from './create-cita.dto';

/**
 * Edición de una cita. El servicio solo permite mover
 * fecha/hora/médico/paciente mientras el estado sea `programada`.
 */
export class UpdateCitaDto extends PartialType(CreateCitaDto) {}
