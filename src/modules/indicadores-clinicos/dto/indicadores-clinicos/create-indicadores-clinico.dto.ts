import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateIndicadoresClinicoDto {
  @IsInt()
  @IsOptional()
  idCategoriaIndicador?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  unidad?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
