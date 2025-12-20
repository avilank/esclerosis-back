import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriasIndicadoresService } from '../services';
import * as dto from '../dto/index';

@Controller('categorias-indicadores')
export class CategoriasIndicadoresController {
  constructor(
    private readonly categoriasIndicadoresService: CategoriasIndicadoresService,
  ) {}

  @Post()
  create(
    @Body() createCategoriasIndicadoreDto: dto.CreateCategoriasIndicadoresDto,
  ) {
    return this.categoriasIndicadoresService.create(
      createCategoriasIndicadoreDto,
    );
  }

  @Get()
  findAll() {
    return this.categoriasIndicadoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasIndicadoresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriasIndicadoreDto: dto.UpdateCategoriasIndicadoreDto,
  ) {
    return this.categoriasIndicadoresService.update(
      +id,
      updateCategoriasIndicadoreDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasIndicadoresService.remove(+id);
  }
}
