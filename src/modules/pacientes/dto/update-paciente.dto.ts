import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteDto } from './create-paciente.dto';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto) {

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @IsOptional()
    dniPaciente?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    nombrePaciente?: string;

    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    edadPaciente?: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @IsOptional()
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

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
