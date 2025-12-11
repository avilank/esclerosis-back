import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { IndicadorUnidad } from 'src/common/enums/indicador-unidad.enum';

export class CreateIndicadoresClinicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @MaxLength(255)
  descripcion: string;

  @IsString()
  @MaxLength(255)
  @IsEnum(IndicadorUnidad)
  unidad: IndicadorUnidad;

  @IsInt()
  idCategoriaIndicador: number;

  @IsBoolean()
  @IsOptional()
  bloqueado?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
