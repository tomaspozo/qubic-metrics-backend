import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';

import { GithubService } from 'src/github/github.service';
import { PrismaService } from 'src/prisma.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly githubService: GithubService,
    private prisma: PrismaService,
  ) {}

  @Get(':repositoryName')
  async getStats(@Param('repositoryName') repositoryName: string) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const repository = await this.prisma.githubRepository.findFirst({
      where: { name: repositoryName },
    });

    if (!repository) {
      throw new HttpException('Repository not found', HttpStatus.NOT_FOUND);
    }

    const stats =
      await this.githubService.getGithubRepositoryMonthToDateStats(
        repositoryName,
      );

    await this.prisma.githubStats.upsert({
      where: {
        repositoryId_month: {
          repositoryId: repository.id,
          month: `${year}-${month}`,
        },
      },
      create: {
        repositoryId: repository.id,
        month: `${year}-${month}`,
        ...stats,
      },
      update: {
        ...stats,
      },
    });

    return { repositoryId: repository.id, month: `${year}-${month}`, ...stats };
  }
}
