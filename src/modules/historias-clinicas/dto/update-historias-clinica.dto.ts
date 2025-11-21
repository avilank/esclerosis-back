import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriasClinicaDto } from './create-historias-clinica.dto';

export class UpdateHistoriasClinicaDto extends PartialType(CreateHistoriasClinicaDto) {}
