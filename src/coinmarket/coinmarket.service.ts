import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CoinmarketApiResponse, CryptoData } from 'src/schemas/coinmarket';

const COINMARKET_API_URL = 'https://pro-api.coinmarketcap.com';

@Injectable()
export class CoinmarketService {
  constructor(private readonly httpService: HttpService) {}

  async getCryptoData(slug: string): Promise<CryptoData> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<CoinmarketApiResponse>(
          `${COINMARKET_API_URL}/v2/cryptocurrency/quotes/latest?slug=${slug}`,
          {
            headers: {
              'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened: ' + error.message;
          }),
        ),
    );

    return Object.entries(data.data)[0][1];
  }
}
