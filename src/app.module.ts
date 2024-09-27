import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GithubModule } from './github/github.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [ScheduleModule.forRoot(), GithubModule, JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
