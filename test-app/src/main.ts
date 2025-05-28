import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed
  app.enableCors();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Zedoc Test API')
    .setDescription('Test application for @kodesonik/zedoc library - demonstrating Swagger integration')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Development server')
    .addTag('App', 'Application endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Set the Swagger document for Zedoc
  ZedocModule.setSwaggerDocument(app, document);
  
  await app.listen(3000);
  console.log('🚀 Test application is running on: http://localhost:3000');
  console.log('📚 Swagger UI available at: http://localhost:3000/api');
  console.log('📖 Zedoc documentation available at: http://localhost:3000/docs');
  console.log('🔗 Swagger JSON available at: http://localhost:3000/api-json');
}
bootstrap(); 