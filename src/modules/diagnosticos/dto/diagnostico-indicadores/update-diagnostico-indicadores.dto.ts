import { PartialType } from '@nestjs/mapped-types';
import { CreateDiagnosticoIndicadoresDto } from './create-diagnostico-indicadores.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDiagnosticoIndicadoresDto extends PartialType(
  CreateDiagnosticoIndicadoresDto,
) {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  valor?: string;
}
