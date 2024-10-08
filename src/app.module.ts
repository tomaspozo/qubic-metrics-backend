import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GithubModule } from './github/github.module';
import { JobsModule } from './jobs/jobs.module';
import { StatsModule } from './stats/stats.module';
import { QubicModule } from './qubic/qubic.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 3600,
      max: 100,
      isGlobal: true,
    }),
    GithubModule,
    JobsModule,
    StatsModule,
    QubicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
