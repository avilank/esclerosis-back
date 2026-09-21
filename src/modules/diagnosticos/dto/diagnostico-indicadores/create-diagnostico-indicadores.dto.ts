import { IsNotEmpty, IsInt, IsDateString, IsString } from 'class-validator';

export class CreateDiagnosticoIndicadoresDto {
  @IsInt()
  @IsNotEmpty()
  idDiagnostico: number;

  @IsInt()
  @IsNotEmpty()
  idIndicador: number;

  @IsString()
  @IsNotEmpty()
  valor: string;

  // El cliente manda 'YYYY-MM-DD'; la columna es `date` y TypeORM la maneja
  // como string en ambos sentidos.
  @IsDateString()
  @IsNotEmpty()
  fechaMedicion: string;
}
