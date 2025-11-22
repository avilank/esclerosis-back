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
  @MaxLength(255)
  Modelo_IA: string;

  @IsDateString()
  @IsNotEmpty()
  fechaReceta: string;

}
