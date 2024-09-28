import { Module } from '@nestjs/common';
import { QubicService } from './qubic.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [QubicService],
})
export class QubicModule {}
