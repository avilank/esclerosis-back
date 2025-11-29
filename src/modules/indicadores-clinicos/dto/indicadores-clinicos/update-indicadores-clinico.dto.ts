import { PartialType } from '@nestjs/mapped-types';
import { CreateIndicadoresClinicoDto } from './create-indicadores-clinicos.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateIndicadoresClinicoDto extends PartialType(CreateIndicadoresClinicoDto) {
    @IsString()
    @IsOptional()
    @MaxLength(255)
    nombre?: string;
    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string;
    @IsString()
    @IsOptional()
    @MaxLength(255)
    unidad?: string;

}
