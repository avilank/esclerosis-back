import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateTratamientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

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
