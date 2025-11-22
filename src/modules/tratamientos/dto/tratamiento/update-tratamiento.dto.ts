import { PartialType } from '@nestjs/mapped-types';
import { CreateTratamientoDto } from '../tratamiento/create-tratamiento.dto';

export class UpdateTratamientoDto extends PartialType(CreateTratamientoDto) {}
