import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GithubService],
})
export class GithubModule {}
