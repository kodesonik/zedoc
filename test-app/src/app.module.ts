import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {} 