import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateDiagnosticoDto {
  @IsInt()
  @IsNotEmpty()
  idhistoriaClinica: number;

  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @IsDateString()
  @IsNotEmpty()
  fechaDiagnostico: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  estadoSalud?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  gradoEnfermedad?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsBoolean()
  @IsOptional()
  es_diagnostico_inicial?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
