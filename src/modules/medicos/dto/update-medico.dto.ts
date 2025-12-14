import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicoDto } from './create-medico.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMedicoDto extends PartialType(CreateMedicoDto) {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @IsOptional()
    nombre?: string;
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @IsOptional()
    genero?: string;
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    idArea?: number;
    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    idSede?: number;
}
    