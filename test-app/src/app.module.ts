import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Auto-Structured API Documentation',
      description: 'Demonstrating automatic conversion of Swagger ApiTags to sections and ApiOperation summaries to modules',
      version: '3.0.0',
      theme: {
        preset: 'default',
        mode: 'dark',
        // colors: {
        //   primary: '#ff6c37',
        //   secondary: '#4a5568',
        //   success: '#48bb78',
        //   warning: '#f59e0b',
        //   danger: '#ef4444',
        // },
        // fonts: {
        //   size: 'md',
        //   family: 'inter'
        // }
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        collapsible: true,
        width: '350px',
        try: {
          enabled: true,
          position: 'auto',
          width: '450px',
          defaultExpanded: false,
        }
      },
      environment: {
        variables: [
          {
            name: 'accessToken',
            value: '',
            description: 'JWT access token for API authentication',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'apiKey',
            value: '',
            description: 'API key for service authentication',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'userId',
            value: '123',
            description: 'Default user ID for testing',
            type: 'query',
            sensitive: false,
          },
        ],
        defaultTokens: {
          accessToken: '',
          apiKey: '',
        },
        headers: {
          'X-Client-Version': '3.0.0',
          'Accept': 'application/json',
        }
      },
      branding: {
        favicon: 'https://nestjs.com/img/favicon.ico',
        logo: {
          src: 'https://nestjs.com/img/logo-small.svg',
          alt: 'NestJS API',
          height: '40px',
          position: 'both',
          link: 'https://nestjs.com'
        },
        cover: {
          src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80',
          alt: 'Auto-Structured API Documentation',
          position: 'hero',
          height: '300px',
          overlay: true,
          overlayColor: 'rgba(255, 108, 55, 0.8)'
        }
      }
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {} 