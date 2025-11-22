import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

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
  unidad: string;

  @IsInt()
  idCategoriaIndicador: number;
}
