import { Module } from '@nestjs/common';
import { CoinmarketService } from './coinmarket.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CoinmarketService],
})
export class CoinmarketModule {}
