import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSedeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  direccion?: string;
}
