import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateCategoriasIndicadoresDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @IsBoolean()
  @IsOptional()
  bloqueado?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
