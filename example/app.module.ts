import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'Comprehensive API documentation for my application',
      version: '1.0.0',
      basePath: '/api',
      tags: ['Users', 'Products'],
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    }),
  ],
  controllers: [UsersController],
})
export class AppModule {} 