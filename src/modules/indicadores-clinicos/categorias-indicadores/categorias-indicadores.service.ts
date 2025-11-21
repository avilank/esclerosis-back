import { Injectable } from '@nestjs/common';
import { CreateCategoriasIndicadoreDto } from './dto/create-categorias-indicadore.dto';
import { UpdateCategoriasIndicadoreDto } from './dto/update-categorias-indicadore.dto';

@Injectable()
export class CategoriasIndicadoresService {
  create(createCategoriasIndicadoreDto: CreateCategoriasIndicadoreDto) {
    return 'This action adds a new categoriasIndicadore';
  }

  findAll() {
    return `This action returns all categoriasIndicadores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriasIndicadore`;
  }

  update(id: number, updateCategoriasIndicadoreDto: UpdateCategoriasIndicadoreDto) {
    return `This action updates a #${id} categoriasIndicadore`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriasIndicadore`;
  }
}
