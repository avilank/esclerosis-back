import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class SugerirRecetaDto {
  @IsInt()
  @IsNotEmpty()
  idDiagnostico: number;

  /** Si es true, ignora caché y vuelve a llamar a OpenRouter. */
  @IsOptional()
  @IsBoolean()
  regenerar?: boolean;
}
