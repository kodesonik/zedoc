import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { UsersController } from './users.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Zedoc Test API with Themes',
      description: 'Demonstrating theme capabilities of @kodesonik/zedoc library',
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
        }
      }
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {} 