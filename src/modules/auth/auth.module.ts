import { Module } from '@nestjs/common';
import { AuthService } from './authentication/auth.service';
import { AuthController } from './authentication/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
