import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateRecetaDto {
  @IsInt()
  @IsNotEmpty()
  idDiagnostico: number;

  @IsInt()
  @IsNotEmpty()
  idTratamiento: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  Modelo_IA?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaReceta: string;

  @IsString()
  @IsOptional()
  contenido?: string;
}
