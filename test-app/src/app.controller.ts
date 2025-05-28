import { Controller, Get } from '@nestjs/common';
import { ApiDoc } from '@kodesonik/zedoc';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiDoc({
    summary: 'Get hello message',
    description: 'Returns a simple hello world message',
    tags: ['App'],
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiDoc({
    summary: 'Health check',
    description: 'Check if the application is running',
    tags: ['App'],
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
} 