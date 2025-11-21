import { Injectable } from '@nestjs/common';
import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

@Injectable()
export class HistoriasClinicasService {
  create(createHistoriasClinicaDto: CreateHistoriasClinicaDto) {
    return 'This action adds a new historiasClinica';
  }

  findAll() {
    return `This action returns all historiasClinicas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historiasClinica`;
  }

  update(id: number, updateHistoriasClinicaDto: UpdateHistoriasClinicaDto) {
    return `This action updates a #${id} historiasClinica`;
  }

  remove(id: number) {
    return `This action removes a #${id} historiasClinica`;
  }
}
