import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaService } from 'src/prisma.service';
import { GithubService } from 'src/github/github.service';

import { StatsController } from './stats.controller';
import { QubicService } from 'src/qubic/qubic.service';
import { JobsService } from 'src/jobs/jobs.service';

@Module({
  imports: [HttpModule],
  controllers: [StatsController],
  providers: [PrismaService, GithubService, QubicService, JobsService],
})
export class StatsModule {}
