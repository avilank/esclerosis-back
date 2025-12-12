import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Rol } from '../auth/roles/entities/role.entity';
import { RolesModule } from '../auth/roles/roles.module';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';
import { Area } from '../areas/entities/area.entity';
import { Sede } from '../sedes/entities/sede.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Paciente,
      Medico,
      HistoriaClinica,
      Area,
      Sede,
    ]),
    RolesModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
