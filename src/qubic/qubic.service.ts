import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { QubicStats } from 'src/schemas/qubic';

@Injectable()
export class QubicService {
  constructor(private readonly httpService: HttpService) {}

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
}
