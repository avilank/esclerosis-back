import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosService } from './services/permisos.service';
import { PermisosController } from './controllers/permisos.controller';
import { Permiso } from './entities/permiso.entity';
import { PermisoRol } from './entities/permiso-rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permiso, PermisoRol])],
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
