import { Body, Controller, Post } from '@nestjs/common';
import { IaService } from './ia.service';
import { SugerirRecetaDto } from './dto/sugerir-receta.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

// El asistente de prescripcion consume credito de OpenRouter: solo el personal
// clinico autenticado puede dispararlo.
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('recetas/sugerir')
  sugerir(@Body() dto: SugerirRecetaDto) {
    return this.iaService.sugerirReceta(
      dto.idDiagnostico,
      dto.regenerar === true,
    );
  }
}
