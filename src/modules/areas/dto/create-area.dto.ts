import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;
}
