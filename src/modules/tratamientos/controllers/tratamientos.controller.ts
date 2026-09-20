import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TratamientosService } from '../services/tratamientos.service';
import { CreateTratamientoDto } from '../dto/tratamiento/create-tratamiento.dto';
import { UpdateTratamientoDto } from '../dto/tratamiento/update-tratamiento.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

// Lectura para admin y medico; la escritura queda restringida a admin
// en cada handler (el medico solo consulta estos catalogos).
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Roles(ROL_ADMIN)
  @Post()
  create(@Body() createTratamientoDto: CreateTratamientoDto) {
    return this.tratamientosService.create(createTratamientoDto);
  }

  @Get()
  findAll() {
    return this.tratamientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tratamientosService.findOne(+id);
  }

  @Roles(ROL_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTratamientoDto: UpdateTratamientoDto,
  ) {
    return this.tratamientosService.update(+id, updateTratamientoDto);
  }

  @Roles(ROL_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tratamientosService.remove(+id);
  }
}
