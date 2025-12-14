import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Rol } from './entities/role.entity';
import { PermisoRol } from '../permisos/entities/permiso-rol.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, PermisoRol, Usuario])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
