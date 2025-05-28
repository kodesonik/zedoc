import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { UsersController } from './users.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Zedoc Test API',
      description: 'Test application for @kodesonik/zedoc library',
      version: '1.0.0',
      basePath: '/api',
      tags: ['Users', 'App'],
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {} 