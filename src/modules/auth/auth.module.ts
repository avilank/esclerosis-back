import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { PermisosModule } from './permisos/permisos.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [AuthenticationModule, PermisosModule, RolesModule],
  exports: [AuthenticationModule, PermisosModule, RolesModule],
})
export class AuthModule {}
