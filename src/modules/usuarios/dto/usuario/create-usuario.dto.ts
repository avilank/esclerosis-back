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
  Matches,
  Min,
  Max,
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
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255)
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'La contraseña debe combinar letras y números',
  })
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
  @Min(0)
  @Max(120)
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
