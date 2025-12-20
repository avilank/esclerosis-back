import * as modules from './index';
import { Module } from '@nestjs/common'; // decorador
@Module({
  imports: Object.values(modules),
  exports: Object.values(modules),
})
export class BaseModule {}
