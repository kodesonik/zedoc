import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { UsersController } from './users.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Zedoc Test API with Environment Variables',
      description: 'Demonstrating environment variables, font, sidebar and theme capabilities of @kodesonik/zedoc library',
      version: '2.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
        colors: {
          primary: '#ff6c37',
          secondary: '#4a5568',
          success: '#48bb78',
          warning: '#ed8936',
          danger: '#f56565',
        },
        fonts: {
          size: 'md',
          family: 'inter'
        }
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        collapsible: true,
        width: '350px',
        try: {
          enabled: true,
          position: 'auto', // Will be positioned on the right (opposite of sidebar)
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
            name: 'refreshToken',
            value: '',
            description: 'JWT refresh token for token renewal',
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
          refreshToken: '',
          apiKey: '',
          bearerToken: '',
        },
        headers: {
          'X-Client-Version': '1.0.0',
          'X-Platform': 'web',
        },
        queryParams: {
          'version': 'v1',
        },
      }
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {} 