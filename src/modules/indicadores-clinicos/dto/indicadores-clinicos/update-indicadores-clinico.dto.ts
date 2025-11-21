import { PartialType } from '@nestjs/mapped-types';
import { CreateIndicadoresClinicoDto } from './create-indicadores-clinico.dto';

export class UpdateIndicadoresClinicoDto extends PartialType(CreateIndicadoresClinicoDto) {}
