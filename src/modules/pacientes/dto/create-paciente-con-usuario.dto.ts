import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Alta completa de un paciente: crea el `usuario` (rol paciente), su ficha de
 * `paciente` y su `historia_clinica`, todo en una transacción.
 *
 * Existe para que la secretaria pueda dar de alta pacientes sin abrirle
 * `POST /usuarios` (que permite crear admins y médicos).
 */
export class CreatePacienteConUsuarioDto {
  // --- Credenciales ---
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @IsEmail({}, { message: 'El email no es válido' })
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

  // --- Ficha del paciente ---
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
  @Min(0)
  @Max(120)
  edadPaciente: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  generoPaciente: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccionPaciente?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefonoPaciente?: string;
}
