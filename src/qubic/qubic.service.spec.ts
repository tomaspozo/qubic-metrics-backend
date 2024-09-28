import { Test, TestingModule } from '@nestjs/testing';
import { QubicService } from './qubic.service';

describe('QubicService', () => {
  let service: QubicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QubicService],
    }).compile();

    service = module.get<QubicService>(QubicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
