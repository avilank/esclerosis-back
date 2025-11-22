import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriasIndicadoreDto } from './create-categorias-indicadore.dto';

export class UpdateCategoriasIndicadoreDto extends PartialType(CreateCategoriasIndicadoreDto) {}
