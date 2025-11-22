import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoriasIndicadoresDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;
}
