import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsString,
} from 'class-validator';

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

  @IsDateString()
  @IsNotEmpty()
  fechaMedicion: Date;

}
