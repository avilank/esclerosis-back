import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  genero?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  especialidad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  numeroColegiatura?: string;

  @IsInt()
  @IsOptional()
  idArea?: number;

  @IsInt()
  @IsOptional()
  idSede?: number;

  @IsInt()
  @IsOptional()
  idUsuario?: number;
}
