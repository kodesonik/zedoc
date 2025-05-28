import { NestFactory } from '@nestjs/core';
import { StructuredAppModule } from './structured-app.module';

async function bootstrap() {
  const app = await NestFactory.create(StructuredAppModule);
  
  // Enable CORS if needed
  app.enableCors();
  
  await app.listen(3001);
  console.log('🚀 Structured test application is running on: http://localhost:3001');
  console.log('📖 Unified Zedoc documentation (structured mode) available at: http://localhost:3001/docs');
  console.log('⚙️ Configuration available at: http://localhost:3001/docs/config');
}
bootstrap(); 