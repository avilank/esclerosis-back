import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsBoolean,
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

  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
