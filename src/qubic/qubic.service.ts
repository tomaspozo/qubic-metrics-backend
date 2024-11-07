import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  QubicLILoginResponse,
  QubicLIScoresResponse,
  QubicStats,
} from 'src/schemas/qubic';

@Injectable()
export class QubicService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager,
  ) {}

  async getQubicStats() {
    const { data } = await firstValueFrom(
      this.httpService
        .get<{ data: QubicStats }>('https://rpc.qubic.org/v1/latest-stats')
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data.data;
  }

  async getQubicLIToken() {
    const cachedToken = await this.cacheManager.get('qubic-li-token');
    if (cachedToken) {
      return cachedToken;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .post<QubicLILoginResponse>('https://api.qubic.li/Auth/Login', {
          password: process.env.QUBIC_LI_PASSWORD,
          userName: process.env.QUBIC_LI_EMAIL,
          twoFactorCode: null,
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log('error', error.response.data);
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    await this.cacheManager.set(
      'qubic-li-token',
      data.token,
      60 * 60 * 24, // 24 hours
    );

    return data.token;
  }

  async getQubicLIScoresWithToken(token: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get<QubicLIScoresResponse>('https://api.qubic.li/Score/Get', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return data;
  }
}
