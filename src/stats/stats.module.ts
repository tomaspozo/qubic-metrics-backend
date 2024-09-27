import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaService } from 'src/prisma.service';
import { GithubService } from 'src/github/github.service';

import { StatsController } from './stats.controller';

@Module({
  imports: [HttpModule],
  controllers: [StatsController],
  providers: [GithubService, PrismaService],
})
export class StatsModule {}
