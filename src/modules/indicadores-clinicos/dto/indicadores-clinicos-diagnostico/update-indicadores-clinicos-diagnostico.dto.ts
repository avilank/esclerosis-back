import { PartialType } from '@nestjs/mapped-types';
import { CreateIndicadoresClinicosDiagnosticoDto } from './create-indicadores-clinicos-diagnostico.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateIndicadoresClinicosDiagnosticoDto extends PartialType(CreateIndicadoresClinicosDiagnosticoDto) {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    valor?: string;

}