import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SedesService } from '../services/sedes.service';
import { CreateSedeDto } from '../dto/sede/create-sede.dto';
import { UpdateSedeDto } from '../dto/sede/update-sede.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN } from 'src/common/constants/roles.constant';

// Modulo de administracion: solo el rol admin.
@Roles(ROL_ADMIN)
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Post()
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto);
  }

  @Get()
  findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sedesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedesService.update(+id, updateSedeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sedesService.remove(+id);
  }
}
