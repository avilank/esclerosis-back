import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dniPaciente: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombrePaciente: string;

  @IsInt()
  @IsNotEmpty()
  edadPaciente: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  generoPaciente: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccionPaciente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefonoPaciente?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
