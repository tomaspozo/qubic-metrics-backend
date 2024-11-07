import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/prisma.service';

import { GithubService } from 'src/github/github.service';
import { QubicService } from 'src/qubic/qubic.service';
import { format } from 'date-fns';

const ORG_NAME = 'qubic';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private githubService: GithubService,
    private qubicService: QubicService,
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

  @Cron(CronExpression.EVERY_HOUR)
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async importQubicLIScores() {
    const authData = await this.qubicService.getQubicLIToken();
    const scores = await this.qubicService.getQubicLIScoresWithToken(authData);
    const date = format(new Date(scores.createdAt), 'yyyy-MM-dd');

    await this.prisma.qubicLIScoreStats.upsert({
      where: {
        date,
      },
      create: {
        date,
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

    for (const score of scores.scores) {
      await this.prisma.qubicLIScore.upsert({
        where: {
          id: score.id,
        },
        create: {
          ...score,
          updated: new Date(score.updated),
          checked: new Date(score.checked),
        },
        update: {
          ...score,
          updated: new Date(score.updated),
          checked: new Date(score.checked),
        },
      });
    }

    this.logger.debug('Qubic.li scores sync finished');
  }
}
