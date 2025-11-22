import { Module } from '@nestjs/common';
import { BaseModule } from './modules/base.module';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [DatabaseModule, BaseModule],
})
export class AppModule { }
