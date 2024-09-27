import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaService } from 'src/prisma.service';
import { GithubService } from 'src/github/github.service';

import { JobsService } from './jobs.service';

@Module({
  imports: [HttpModule],
  providers: [JobsService, PrismaService, GithubService],
})
export class JobsModule {}
