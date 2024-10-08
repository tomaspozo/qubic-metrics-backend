import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api-key')
  async getApiKey(@Body() body: { email: string }) {
    const { token, createdAt } = await this.appService.getApiKey(body);

    return `
      <h1>Your API key</h1>
      <p>Your API key is: <code>${token}</code></p>
      <p>This token was created at: ${createdAt}</p>
      <p>Every token lasts for 30 days. After that, you can request a new one.</p>
      <p>Please keep it safe. You can use it to authenticate your requests.</p>
      <p>Note that API keys are limited to 10 requests per day.</p>
    `;
  }
}
