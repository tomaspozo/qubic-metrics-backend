import { Test, TestingModule } from '@nestjs/testing';
import { CoinmarketService } from './coinmarket.service';

describe('CoinmarketService', () => {
  let service: CoinmarketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinmarketService],
    }).compile();

    service = module.get<CoinmarketService>(CoinmarketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
