import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
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
  @MaxLength(500)
  direccionPaciente: string;

  @IsString()
  @MaxLength(20)
  telefonoPaciente: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

}
