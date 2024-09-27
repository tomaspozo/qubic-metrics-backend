import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/prisma.service';

import { GithubService } from 'src/github/github.service';

const ORG_NAME = 'qubic';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private githubService: GithubService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
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
}
