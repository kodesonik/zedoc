import { NestFactory } from '@nestjs/core';
import { StructuredAppModule } from './structured-app.module';

async function bootstrap() {
  const app = await NestFactory.create(StructuredAppModule);

  await app.listen(3001);
  console.log('🚀 Structured documentation test application is running on: http://localhost:3001');
  console.log('📚 Structured documentation available at: http://localhost:3001/structured-docs');
  console.log('⚙️ Configuration available at: http://localhost:3001/structured-docs/config');
}
bootstrap(); 