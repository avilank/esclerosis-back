import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

/** `HH:mm` en 24 h. La columna es `time`; el servicio normaliza al devolver. */
export const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateCitaDto {
  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @IsDateString()
  @IsNotEmpty()
  fechaCita: string;

  @IsString()
  @IsNotEmpty()
  @Matches(HORA_REGEX, { message: 'horaCita debe tener formato HH:mm (24 h)' })
  horaCita: string;

  /** Si no viene, se copia la sede del médico. */
  @IsInt()
  @IsOptional()
  idSede?: number;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
