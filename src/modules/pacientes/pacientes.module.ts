import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './entities/paciente.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../auth/roles/entities/role.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Usuario, Rol, HistoriaClinica]),
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
