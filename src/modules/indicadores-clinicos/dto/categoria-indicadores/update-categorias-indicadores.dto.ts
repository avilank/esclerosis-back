import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriasIndicadoresDto } from './create-categorias-indicadores.dto';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoriasIndicadoreDto extends PartialType(CreateCategoriasIndicadoresDto) {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    descripcion?: string;
}
