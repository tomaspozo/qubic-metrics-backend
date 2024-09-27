import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GithubModule } from './github/github.module';
import { JobsModule } from './jobs/jobs.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [ScheduleModule.forRoot(), GithubModule, JobsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
