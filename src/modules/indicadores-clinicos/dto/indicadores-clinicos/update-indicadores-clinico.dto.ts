import { PartialType } from '@nestjs/mapped-types';
import { CreateIndicadoresClinicoDto } from './create-indicadores-clinicos.dto';

export class UpdateIndicadoresClinicoDto extends PartialType(
  CreateIndicadoresClinicoDto,
) {}
