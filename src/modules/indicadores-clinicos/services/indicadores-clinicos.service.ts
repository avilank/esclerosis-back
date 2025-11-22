import { Injectable } from '@nestjs/common';
import { CreateIndicadoresClinicoDto } from '../dto/indicadores-clinicos/create-indicadores-clinico.dto';
import { UpdateIndicadoresClinicoDto } from '../dto/indicadores-clinicos/update-indicadores-clinico.dto';

@Injectable()
export class IndicadoresClinicosService {
  create(createIndicadoresClinicoDto: CreateIndicadoresClinicoDto) {
    return 'This action adds a new indicadoresClinico';
  }

  findAll() {
    return `This action returns all indicadoresClinicos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} indicadoresClinico`;
  }

  update(id: number, updateIndicadoresClinicoDto: UpdateIndicadoresClinicoDto) {
    return `This action updates a #${id} indicadoresClinico`;
  }

  remove(id: number) {
    return `This action removes a #${id} indicadoresClinico`;
  }
}
