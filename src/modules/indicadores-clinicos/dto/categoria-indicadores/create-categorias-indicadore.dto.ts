import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoriasIndicadoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;
}
