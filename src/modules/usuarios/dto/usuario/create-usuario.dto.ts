import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  MaxLength,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsInt()
  @IsOptional()
  idRol?: number;

  // Datos de Paciente (opcionales)
  @IsString()
  @IsOptional()
  @MaxLength(20)
  dniPaciente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombrePaciente?: string;

  @IsInt()
  @IsOptional()
  edadPaciente?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  generoPaciente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccionPaciente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefonoPaciente?: string;

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  // Datos de Médico (opcionales)
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombreMedico?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  generoMedico?: string;

  @IsInt()
  @IsOptional()
  idArea?: number;

  @IsInt()
  @IsOptional()
  idSede?: number;
}
