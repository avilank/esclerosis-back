import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

/**
 * Recetas: las genera y consulta el personal clinico. Un paciente NO puede
 * listar este recurso (devolvia las recetas de todos los pacientes del
 * sistema); su tratamiento actual lo ve por su historia clinica y por
 * `/diagnosticos/stats/paciente/:idPaciente`.
 */
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetasService.create(createRecetaDto);
  }

  @Get()
  findAll() {
    return this.recetasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecetaDto: UpdateRecetaDto,
  ) {
    return this.recetasService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.remove(id);
  }
}
