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
}
