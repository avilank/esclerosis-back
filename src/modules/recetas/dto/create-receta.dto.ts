import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
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
  @IsNotEmpty()
  @MaxLength(255)
  Modelo_IA: string;

  @IsDateString()
  @IsNotEmpty()
  fechaReceta: string;

  @IsString()
  @IsOptional()
  contenido?: string;

  @IsString()
  @IsOptional()
  sustentacion?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
