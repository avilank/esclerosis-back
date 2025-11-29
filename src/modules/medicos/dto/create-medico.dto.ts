import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @MaxLength(20)
  genero: string;

  @IsInt()
  idArea: number;

  @IsInt()
  idSede: number;

}
