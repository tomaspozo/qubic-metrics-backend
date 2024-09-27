import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

import { Repository } from 'src/schemas/repository';

const GITHUB_API = 'https://api.github.com';
const ORG_NAME = 'qubic';

@Injectable()
export class GithubService {
  constructor(private readonly httpService: HttpService) {}

  async getGithubRepositories() {
    const { data } = await firstValueFrom(
      this.httpService
        .get<Repository[]>(
          `${GITHUB_API}/orgs/${ORG_NAME}/repos?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data;
  }

  async getGithubRepositoryCommitActivity(repo: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${GITHUB_API}/repos/${ORG_NAME}/${repo}/stats/commit_activity?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data;
  }

  async getGithubRepositoryCommitsPerMonth(repo: string) {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

    const commitActivity = await this.getGithubRepositoryCommitActivity(repo);
    if (!Array.isArray(commitActivity)) {
      return 0;
    }

    const commitsPerMonth = commitActivity
      .filter((week) => new Date(week.week * 1000) >= startDate)
      .reduce((total, week) => total + week.total, 0);
    return commitsPerMonth;
  }

  async getGithubRepositoryContributors(repo: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${GITHUB_API}/repos/${ORG_NAME}/${repo}/contributors?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data;
  }

  async getGithubRepositoryContributorsCount(repo: string) {
    const data = await this.getGithubRepositoryContributors(repo);

    return data.length;
  }

  async getGithubRepositoryIssues(
    repo: string,
    state: 'open' | 'closed',
    since?: string,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${GITHUB_API}/repos/${ORG_NAME}/${repo}/issues?per_page=100&state=${state}&since=${since}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data;
  }

  async getGithubRepositoryIssuesCount(
    repo: string,
    state: 'open' | 'closed',
    since?: string,
  ) {
    const data = await this.getGithubRepositoryIssues(repo, state, since);

    return data.length;
  }

  async getGithubRepositoryBranchesCount(repo: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${GITHUB_API}/repos/${ORG_NAME}/${repo}/branches?per_page=100`, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data.length || 0;
  }

  async getGithubRepositoryReleasesCount(repo: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${GITHUB_API}/repos/${ORG_NAME}/${repo}/releases?per_page=100`, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data.length || 0;
  }

  async getGithubRepositoryMonthToDateStats(repositoryName: string) {
    const today = new Date();
    const beginningOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      commits,
      contributors,
      openIssues,
      closedIssues,
      branches,
      releases,
    ] = await Promise.all([
      this.getGithubRepositoryCommitsPerMonth(repositoryName),
      this.getGithubRepositoryContributorsCount(repositoryName),
      this.getGithubRepositoryIssuesCount(
        repositoryName,
        'open',
        beginningOfMonth.toISOString(),
      ),
      this.getGithubRepositoryIssuesCount(
        repositoryName,
        'closed',
        beginningOfMonth.toISOString(),
      ),
      this.getGithubRepositoryBranchesCount(repositoryName),
      this.getGithubRepositoryReleasesCount(repositoryName),
    ]);

    return {
      commits,
      contributors,
      openIssues,
      closedIssues,
      branches,
      releases,
    };
  }
}
