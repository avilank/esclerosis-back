import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AreasModule, SedesModule, CategoriasIndicadoresModule, TratamientosModule, RolesModule, PermisosModule, UsuariosModule, PacientesModule, MedicosModule, HistoriasClinicasModule, IndicadoresClinicosModule, DiagnosticosModule, RecetasModule } from './modules';

@Module({
  imports: [DatabaseModule, AreasModule, SedesModule, CategoriasIndicadoresModule, TratamientosModule, RolesModule, PermisosModule, UsuariosModule, PacientesModule, MedicosModule, HistoriasClinicasModule, IndicadoresClinicosModule, DiagnosticosModule, RecetasModule],
})
export class AppModule {}
