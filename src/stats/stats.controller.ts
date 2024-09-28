import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { QubicService } from 'src/qubic/qubic.service';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly qubic: QubicService,
    private prisma: PrismaService,
  ) {}

  @Get('qubic')
  async getQubicStats() {
    return this.prisma.qubicStats.findMany({});
  }

  @Get('')
  async listRepositories() {
    const repositories = await this.prisma.githubRepository.findMany({
      take: 1000,
      select: {
        id: true,
        name: true,
        starsCount: true,
        watchersCount: true,
        stats: {
          select: {
            month: true,
            commits: true,
            contributors: true,
            openIssues: true,
            closedIssues: true,
            branches: true,
            releases: true,
          },
        },
      },
      orderBy: {
        starsCount: 'desc',
      },
    });

    return {
      data: repositories,
      totalCount: repositories.length,
    };
  }

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
