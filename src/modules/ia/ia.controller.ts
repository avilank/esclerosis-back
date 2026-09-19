import { Body, Controller, Post } from '@nestjs/common';
import { IaService } from './ia.service';
import { SugerirRecetaDto } from './dto/sugerir-receta.dto';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('recetas/sugerir')
  sugerir(@Body() dto: SugerirRecetaDto) {
    return this.iaService.sugerirReceta(dto.idDiagnostico, dto.regenerar === true);
  }
}
