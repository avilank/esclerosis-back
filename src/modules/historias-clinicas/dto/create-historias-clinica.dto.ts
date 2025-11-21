import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateHistoriasClinicaDto {
  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  estado?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaIngreso: string;
}
