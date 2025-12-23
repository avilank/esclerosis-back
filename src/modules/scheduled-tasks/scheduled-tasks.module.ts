import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledEtlService } from './scheduled-etl.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ScheduledEtlService],
  exports: [ScheduledEtlService],
})
export class ScheduledTasksModule {}

