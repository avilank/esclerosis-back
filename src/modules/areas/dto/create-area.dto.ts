import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
