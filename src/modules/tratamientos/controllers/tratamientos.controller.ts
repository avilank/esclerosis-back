import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TratamientosService } from '../services/tratamientos.service';
import { CreateTratamientoDto } from '../dto/tratamiento/create-tratamiento.dto';
import { UpdateTratamientoDto } from '../dto/tratamiento/update-tratamiento.dto';

@Controller('tratamientos')
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTratamientoDto: UpdateTratamientoDto) {
    return this.tratamientosService.update(+id, updateTratamientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tratamientosService.remove(+id);
  }
}
