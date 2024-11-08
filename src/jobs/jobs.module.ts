import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaService } from 'src/prisma.service';
import { GithubService } from 'src/github/github.service';
import { QubicService } from 'src/qubic/qubic.service';
import { CoinmarketService } from 'src/coinmarket/coinmarket.service';

import { JobsService } from './jobs.service';

@Module({
  imports: [HttpModule],
  providers: [
    JobsService,
    PrismaService,
    GithubService,
    QubicService,
    CoinmarketService,
  ],
})
export class JobsModule {}
