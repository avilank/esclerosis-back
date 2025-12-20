import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermisosService } from '../services/permisos.service';
import { CreatePermisoDto } from '../dto/permiso/create-permiso.dto';
import { UpdatePermisoDto } from '../dto/permiso/update-permiso.dto';
import { CreatePermisoRolDto } from '../dto/permiso-rol/create-permiso-rol.dto';

@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  // Rutas de Permisos
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Get()
  findAll() {
    return this.permisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permisosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(+id, updatePermisoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.permisosService.remove(+id);
  }

  // Rutas de PermisoRol (Asignación de permisos a roles)
  @Post('asignar-rol')
  @HttpCode(HttpStatus.CREATED)
  asignarPermisoARol(@Body() createPermisoRolDto: CreatePermisoRolDto) {
    return this.permisosService.asignarPermisoARol(createPermisoRolDto);
  }

  @Get('permisos-roles/todos')
  findAllPermisosRoles() {
    return this.permisosService.findAllPermisosRoles();
  }

  @Get('permisos-roles/rol/:idRol')
  findPermisosPorRol(@Param('idRol') idRol: string) {
    return this.permisosService.findPermisosPorRol(+idRol);
  }

  @Get('permisos-roles/permiso/:idPermiso')
  findRolesPorPermiso(@Param('idPermiso') idPermiso: string) {
    return this.permisosService.findRolesPorPermiso(+idPermiso);
  }

  @Delete('permisos-roles/rol/:idRol/permiso/:idPermiso')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarPermisoDeRol(
    @Param('idRol') idRol: string,
    @Param('idPermiso') idPermiso: string,
  ) {
    return this.permisosService.eliminarPermisoDeRol(+idRol, +idPermiso);
  }
}
