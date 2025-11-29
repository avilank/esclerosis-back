import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '../auth/roles/entities/role.entity';
import { RolesModule } from '../auth/roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol]), RolesModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
