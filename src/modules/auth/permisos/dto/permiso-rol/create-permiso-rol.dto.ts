import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreatePermisoRolDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  idRol: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  idPermiso: number;
}

