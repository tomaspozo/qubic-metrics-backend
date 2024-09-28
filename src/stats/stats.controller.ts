import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { JobsService } from 'src/jobs/jobs.service';

import { PrismaService } from 'src/prisma.service';
import { QubicService } from 'src/qubic/qubic.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly qubic: QubicService,
    private prisma: PrismaService,
    private jobs: JobsService,
  ) {}

  @Get('qubic')
  async getQubicStats() {
    const stats = await this.prisma.qubicStats.findMany({
      select: {
        date: true,
        timestamp: true,
        circulatingSupply: true,
        activeAddresses: true,
        price: true,
        marketCap: true,
        epoch: true,
        currentTick: true,
        ticksInCurrentEpoch: true,
        emptyTicksInCurrentEpoch: true,
        epochTickQuality: true,
        burnedQus: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      data: stats,
      totalCount: stats.length,
    };
  }

  @Post('qubic')
  async updateQubicStats() {
    return this.jobs.importQubicStats();
  }

  @Get('github')
  async getGithubStats() {
    const repositories = await this.prisma.githubStats.findMany({
      take: 1000,
      select: {
        date: true,
        commits: true,
        contributors: true,
        openIssues: true,
        closedIssues: true,
        branches: true,
        releases: true,
        starsCount: true,
        watchersCount: true,
        repository: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      data: repositories.map(({ repository, ...attributes }) => ({
        repository: repository.name,
        ...attributes,
      })),
      totalCount: repositories.length,
    };
  }

  @Post('github/repositories')
  async updateGithubRepositories() {
    return this.jobs.importGithubRepositories();
  }

  @Post('github/repositories/stats')
  async updateGithubRepositoriesGithubStats() {
    return this.jobs.importGithubRepositoriesStats();
  }

  @Get('github/:repositoryName')
  async getGithubRepositoryStats(
    @Param('repositoryName') repositoryName: string,
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const repository = await this.prisma.githubRepository.findFirst({
      where: { name: repositoryName },
    });

    if (!repository) {
      throw new HttpException('Repository not found', HttpStatus.NOT_FOUND);
    }

    const stats = await this.prisma.githubStats.findMany({
      where: {
        repositoryId: repository.id,
      },
    });

    return {
      repositoryId: repository.id,
      repository: repositoryName,
      month: `${year}-${month}`,
      ...stats,
    };
  }
}
