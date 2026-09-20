import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IndicadoresClinicosService } from '../services/indicadores-clinicos.service';
import { CreateIndicadoresClinicoDto } from '../dto/indicadores-clinicos/create-indicadores-clinicos.dto';
import { UpdateIndicadoresClinicoDto } from '../dto/indicadores-clinicos/update-indicadores-clinico.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

// Lectura para admin y medico; la escritura queda restringida a admin
// en cada handler (el medico solo consulta estos catalogos).
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('indicadores-clinicos')
export class IndicadoresClinicosController {
  constructor(
    private readonly indicadoresClinicosService: IndicadoresClinicosService,
  ) {}

  @Roles(ROL_ADMIN)
  @Post()
  create(@Body() createIndicadoresClinicoDto: CreateIndicadoresClinicoDto) {
    return this.indicadoresClinicosService.create(createIndicadoresClinicoDto);
  }

  @Get()
  findAll() {
    return this.indicadoresClinicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indicadoresClinicosService.findOne(+id);
  }

  @Roles(ROL_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndicadoresClinicoDto: UpdateIndicadoresClinicoDto,
  ) {
    return this.indicadoresClinicosService.update(
      +id,
      updateIndicadoresClinicoDto,
    );
  }

  @Roles(ROL_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.indicadoresClinicosService.remove(+id);
  }
}
