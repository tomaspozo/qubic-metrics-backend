import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { JobsService } from 'src/jobs/jobs.service';

import { PrismaService } from 'src/prisma.service';
import { QubicService } from 'src/qubic/qubic.service';

@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('stats')
export class StatsController {
  constructor(
    private readonly qubic: QubicService,
    private prisma: PrismaService,
    private jobs: JobsService,
  ) {}

  @Get('qubic/history')
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
        date: 'asc',
      },
    });

    return {
      data: stats.map((item) => ({
        ...item,
        circulatingSupply: parseFloat(item.circulatingSupply),
        marketCap: parseFloat(item.marketCap),
        burnedQus: parseFloat(item.burnedQus),
      })),
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

  @Get('github/overview')
  async getGithubOverviewStats() {
    const lastRecord = await this.prisma.githubStats.findFirst({
      orderBy: {
        date: 'desc',
      },
    });

    const allTimeCommits = await this.prisma.githubStats.aggregate({
      _sum: {
        commits: true,
      },
    });

    const lastStats = await this.prisma.githubStats.aggregate({
      _sum: {
        watchersCount: true,
        starsCount: true,
        contributors: true,
        openIssues: true,
        closedIssues: true,
        branches: true,
        releases: true,
      },
      where: {
        date: lastRecord.date,
      },
    });

    return {
      data: {
        commits: allTimeCommits._sum.commits,
        ...lastStats._sum,
      },
    };
  }

  @Get('github/history')
  async getGithubHistoryStats() {
    const allTimeCommits = await this.prisma.githubStats.groupBy({
      by: ['date'],
      _sum: {
        commits: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const allTimeStats = await this.prisma.githubStats.groupBy({
      by: ['date'],
      _max: {
        watchersCount: true,
        starsCount: true,
        contributors: true,
        openIssues: true,
        closedIssues: true,
        branches: true,
        releases: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = allTimeCommits.map(({ date, _sum: { commits } }) => {
      const lastStats = allTimeStats.find(
        ({ date: lastDate }) => lastDate === date,
      );

      return {
        date,
        commits,
        ...lastStats._max,
      };
    });

    return {
      data,
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

  @Get('github/repositories/:repositoryName')
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
      data: stats,
      totalCount: stats.length,
    };
  }
}
