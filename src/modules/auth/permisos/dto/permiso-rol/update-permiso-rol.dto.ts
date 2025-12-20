import { PartialType } from '@nestjs/mapped-types';
import { CreatePermisoRolDto } from './create-permiso-rol.dto';

export class UpdatePermisoRolDto extends PartialType(CreatePermisoRolDto) {}
