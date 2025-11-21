import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTratamientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;
}
