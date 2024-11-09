import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { format, subDays, subYears } from 'date-fns';
import { AuthGuard } from 'src/auth/auth.guard';
import { JobsService } from 'src/jobs/jobs.service';

import { PrismaService } from 'src/prisma.service';
import { QubicService } from 'src/qubic/qubic.service';

type Range = 'ALL' | '7D' | '30D' | '3M' | '1Y';

function getDatesInRange(range: Range) {
  const today = new Date();
  const dates: string[] = [];
  let startDate: Date;

  switch (range) {
    case '7D':
      startDate = subDays(today, 7);
      break;
    case '30D':
      startDate = subDays(today, 30);
      break;
    case '3M':
      startDate = subDays(today, 90);
      break;
    case '1Y':
      startDate = subYears(today, 1);
      break;
    case 'ALL':
      startDate = new Date('2024-01-01'); // Adjust this date as needed
      break;
    default:
      return [];
  }

  for (
    let date = startDate;
    date <= today;
    date = new Date(date.setDate(date.getDate() + 1))
  ) {
    dates.push(format(date, 'yyyy-MM-dd'));
  }

  return dates;
}

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
  async getQubicStats(@Query('range') range: Range = 'ALL') {
    const btcPrices = await this.prisma.cryptoData.findMany({
      where: {
        symbol: 'BTC',
        date: {
          in: getDatesInRange(range),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const stats = await this.prisma.qubicStats.findMany({
      where: {
        date: {
          in: getDatesInRange(range),
        },
      },
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
      data: stats.map((item) => {
        const btcPrice = btcPrices.find((price) => price.date === item.date);

        return {
          ...item,
          circulatingSupply: parseFloat(item.circulatingSupply),
          marketCap: parseFloat(item.marketCap),
          burnedQus: parseFloat(item.burnedQus),
          btcMarketCap: btcPrice
            ? parseFloat(item.marketCap) / btcPrice.price
            : null,
          btcPrice: btcPrice ? item.price * btcPrice.price : null,
        };
      }),
      totalCount: stats.length,
    };
  }

  @Get('github')
  async getGithubStats(@Query('range') range: Range = 'ALL') {
    const repositories = await this.prisma.githubStats.findMany({
      where: {
        date: {
          in: getDatesInRange(range),
        },
      },
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
  async getGithubOverviewStats(@Query('range') range: Range = 'ALL') {
    const lastRecord = await this.prisma.githubStats.findFirst({
      where: {
        date: {
          in: getDatesInRange(range),
        },
      },
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
  async getGithubHistoryStats(@Query('range') range: Range = 'ALL') {
    const allTimeCommits = await this.prisma.githubStats.groupBy({
      by: ['date'],
      where: {
        date: {
          in: getDatesInRange(range),
        },
      },
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

  @Get('qubic-li/scores')
  async getQubicLIScores(@Query('range') range: Range = 'ALL') {
    const data = await this.prisma.qubicLIScoreStats.findMany({
      where: {
        date: {
          in: getDatesInRange(range),
        },
      },
    });

    return {
      data,
      totalCount: data.length,
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

  @Post('qubic')
  async updateQubicStats() {
    return this.jobs.importQubicStats();
  }

  @Post('qubic-li/scores')
  async updateQubicLIScores() {
    await this.jobs.importQubicLIScores();

    return {
      message: 'Qubic LI scores updated',
    };
  }

  @Post('crypto')
  async updateCryptoData() {
    await this.jobs.importCryptoData();

    return {
      message: 'Crypto data updated',
    };
  }
}
