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
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

// Lectura para admin y medico; la escritura queda restringida a admin
// en cada handler (el medico solo consulta estos catalogos).
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('categorias-indicadores')
export class CategoriasIndicadoresController {
  constructor(
    private readonly categoriasIndicadoresService: CategoriasIndicadoresService,
  ) {}

  @Roles(ROL_ADMIN)
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

  @Roles(ROL_ADMIN)
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

  @Roles(ROL_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasIndicadoresService.remove(+id);
  }
}
