import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';

/** Valores que ofrece el selector del formulario de diagnostico en la app. */
export const ESTADOS_SALUD = ['leve', 'moderado', 'severo', 'crítico'] as const;

export class CreateDiagnosticoDto {
  @IsInt()
  @IsNotEmpty()
  idhistoriaClinica: number;

  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  // El cliente manda la fecha como string ISO, no como objeto Date: con
  // @IsDate() la validacion fallaba siempre al activar el ValidationPipe.
  @IsDateString()
  @IsNotEmpty()
  fechaDiagnostico: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsIn(ESTADOS_SALUD, {
    message: `estadoSalud debe ser uno de: ${ESTADOS_SALUD.join(', ')}`,
  })
  estadoSalud: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  gradoEnfermedad: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  es_diagnostico_inicial?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  /**
   * Cita que se está atendiendo. Si viene, el diagnóstico queda ligado a ella y
   * la cita pasa a `atendida`. Un médico solo puede diagnosticar con cita.
   */
  @IsInt()
  @IsOptional()
  idCita?: number;
}
