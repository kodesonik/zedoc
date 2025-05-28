import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed
  app.enableCors();
  
  await app.listen(3000);
  console.log('🚀 Test application is running on: http://localhost:3000');
  console.log('📚 Documentation available at: http://localhost:3000/docs');
}
bootstrap(); 