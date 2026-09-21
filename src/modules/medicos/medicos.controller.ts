import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_SECRETARIA,
} from 'src/common/constants/roles.constant';

// Lectura para admin, medico y secretaria (necesita el listado para agendar);
// la escritura queda restringida a admin en cada handler.
@Roles(ROL_ADMIN, ROL_MEDICO, ROL_SECRETARIA)
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Roles(ROL_ADMIN)
  @Post()
  create(@Body() createMedicoDto: CreateMedicoDto) {
    return this.medicosService.create(createMedicoDto);
  }

  @Get()
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(+id);
  }

  @Roles(ROL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicoDto: UpdateMedicoDto) {
    return this.medicosService.update(+id, updateMedicoDto);
  }

  @Roles(ROL_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicosService.remove(+id);
  }
}
