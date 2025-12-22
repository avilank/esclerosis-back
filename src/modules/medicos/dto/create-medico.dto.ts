import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  genero: string;

  @IsInt()
  @IsNotEmpty()
  idArea: number;

  @IsInt()
  @IsNotEmpty()
  idSede: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
