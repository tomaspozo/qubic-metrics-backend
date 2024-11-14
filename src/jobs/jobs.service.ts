import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { format, getHours, getMinutes, getWeek, getYear } from 'date-fns';

import { PrismaService } from 'src/prisma.service';

import { GithubService } from 'src/github/github.service';
import { QubicService } from 'src/qubic/qubic.service';
import { CoinmarketService } from 'src/coinmarket/coinmarket.service';
import { getTimeIntervalString } from 'src/utils/time';

const ORG_NAME = 'qubic';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private githubService: GithubService,
    private qubicService: QubicService,
    private coinmarketService: CoinmarketService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async importGithubRepositories() {
    const repositories = await this.githubService.getGithubRepositories();

    for (const repo of repositories) {
      this.logger.debug(`Upserting repository ${repo.name}`);
      await this.prisma.githubRepository.upsert({
        where: {
          organization_name: {
            organization: ORG_NAME,
            name: repo.name,
          },
        },
        create: {
          name: repo.name,
          description: repo.description,
          organization: ORG_NAME,
          githubId: repo.id.toString(),
          url: repo.html_url,
          pushedAt: new Date(repo.pushed_at),
          size: repo.size,
          starsCount: repo.stargazers_count,
          watchersCount: repo.watchers_count,
          language: repo.language,
          license: repo.license?.name,
        },
        update: {
          url: repo.html_url,
          pushedAt: new Date(repo.pushed_at),
          size: repo.size,
          starsCount: repo.stargazers_count,
          watchersCount: repo.watchers_count,
          language: repo.language,
          license: repo.license?.name,
        },
      });
    }

    this.logger.debug('Github repositories finished: ' + repositories.length);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async importGithubRepositoriesStats() {
    const date = format(new Date(), 'yyyy-MM-dd');
    const repositories = await this.prisma.githubRepository.findMany();

    for (const repo of repositories) {
      this.logger.debug(`Processing repository ${repo.name}`);

      const repositoryName = repo.name;

      const stats =
        await this.githubService.getGithubRepositoryMonthToDateStats(
          repositoryName,
        );

      await this.prisma.githubStats.upsert({
        where: {
          repositoryId_date: {
            repositoryId: repo.id,
            date,
          },
        },
        create: {
          ...stats,
          repositoryId: repo.id,
          date,
          starsCount: repo.starsCount,
          watchersCount: repo.watchersCount,
        },
        update: {
          ...stats,
          starsCount: repo.starsCount,
          watchersCount: repo.watchersCount,
        },
      });
    }

    this.logger.debug(
      'Github repositories stats finished: ' + repositories.length,
    );
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async importQubicStats() {
    const date = format(new Date(), 'yyyy-MM-dd');
    const stats = await this.qubicService.getQubicStats();

    await this.prisma.qubicStats.upsert({
      where: {
        date,
      },
      create: {
        date,
        ...stats,
      },
      update: {
        ...stats,
      },
    });

    this.logger.debug('Qubic stats sync finished');
  }

  @Cron('55 11 * * *')
  async importQubicLIScoresStats() {
    const authData = await this.qubicService.getQubicLIToken();
    const scores = await this.qubicService.getQubicLIScoresWithToken(authData);
    const date = scores.createdAt;

    const dayString = format(new Date(scores.createdAt), 'yyyy-MM-dd');
    const weekString = format(new Date(scores.createdAt), 'yyyy-II');
    const hourString = format(new Date(scores.createdAt), 'yyyy-MM-dd HH:00');

    const yearNumber = getYear(new Date(scores.createdAt));
    const weekNumber = getWeek(new Date(scores.createdAt));
    const hourNumber = getHours(new Date(scores.createdAt));
    const minuteNumber = getMinutes(new Date(scores.createdAt));

    await this.prisma.qubicLIScoreStats.upsert({
      where: {
        date,
      },
      create: {
        date,
        dayString,
        weekString,
        hourString,
        yearNumber,
        weekNumber,
        hourNumber,
        minuteNumber,
        minScore: scores.minScore,
        maxScore: scores.maxScore,
        averageScore: scores.averageScore,
        estimatedIts: scores.estimatedIts,
        solutionsPerHour: scores.solutionsPerHour,
        solutionsPerHourCalculated: scores.solutionsPerHourCalculated,
        difficulty: scores.difficulty,
      },
      update: {
        minScore: scores.minScore,
        maxScore: scores.maxScore,
        averageScore: scores.averageScore,
        estimatedIts: scores.estimatedIts,
        solutionsPerHour: scores.solutionsPerHour,
        solutionsPerHourCalculated: scores.solutionsPerHourCalculated,
        difficulty: scores.difficulty,
      },
    });

    this.logger.debug('Qubic.li scores stats sync finished');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async importQubicLIScores() {
    const authData = await this.qubicService.getQubicLIToken();
    const scores = await this.qubicService.getQubicLIScoresWithToken(authData);

    for (const score of scores.scores) {
      const date = new Date(score.checked);
      const dayString = format(date, 'yyyy-MM-dd');
      const weekString = format(date, 'yyyy-II');
      const hourString = format(date, 'yyyy-MM-dd HH:00');
      const time5minIntervalString = getTimeIntervalString(date);

      const yearNumber = getYear(date);
      const hourNumber = getHours(date);
      const minuteNumber = getMinutes(date);
      const weekNumber = getWeek(date);

      await this.prisma.qubicLIScore.upsert({
        where: {
          id: score.id,
        },
        create: {
          ...score,
          dayString,
          weekString,
          hourString,
          time5minIntervalString,
          yearNumber,
          weekNumber,
          hourNumber,
          minuteNumber,
          updated: new Date(score.updated),
          checked: new Date(score.checked),
        },
        update: {
          ...score,
          dayString,
          weekString,
          hourString,
          yearNumber,
          time5minIntervalString,
          weekNumber,
          hourNumber,
          minuteNumber,
          updated: new Date(score.updated),
          checked: new Date(score.checked),
        },
      });
    }

    this.logger.debug('Qubic.li scores sync finished');
  }

  @Cron('50 11 * * *')
  async importCryptoData() {
    const symbol = 'BTC';
    const slug = 'bitcoin';

    const data = await this.coinmarketService.getCryptoData(slug);
    const date = format(new Date(data.last_updated), 'yyyy-MM-dd');

    await this.prisma.cryptoData.upsert({
      where: {
        symbol_date: {
          symbol,
          date,
        },
      },
      create: {
        date,
        symbol,
        name: data.name,
        price: data.quote.USD.price,
        volume: data.quote.USD.volume_24h,
        marketCap: data.quote.USD.market_cap,
        metadata: JSON.parse(JSON.stringify(data)),
      },
      update: {
        price: data.quote.USD.price,
        volume: data.quote.USD.volume_24h,
        marketCap: data.quote.USD.market_cap,
        metadata: JSON.parse(JSON.stringify(data)),
      },
    });

    this.logger.debug('Crypto data sync finished');
  }
}
