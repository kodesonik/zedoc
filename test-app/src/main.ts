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
    .setTitle('Auto-Structured Zedoc API')
    .setDescription('Test application demonstrating automatic conversion of Swagger ApiTags to sections and ApiOperation summaries to modules')
    .setVersion('3.0.0')
    .addServer('http://localhost:3000', 'Development server')
    .addTag('App', 'Application endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Set the Swagger document for Zedoc - sections will be auto-generated from ApiTags
  ZedocModule.setSwaggerDocument(app, document);
  
  await app.listen(3000);
  console.log('🚀 Auto-structured test application is running on: http://localhost:3000');
  console.log('📚 Swagger UI available at: http://localhost:3000/api');
  console.log('📖 Auto-structured Zedoc documentation available at: http://localhost:3000/docs');
  console.log('⚙️ Configuration (showing auto-generated sections) available at: http://localhost:3000/docs/config');
  console.log('🔗 Swagger JSON available at: http://localhost:3000/api-json');
  console.log('');
  console.log('✨ Features:');
  console.log('   • ApiTags automatically converted to sections');
  console.log('   • ApiOperation summaries automatically converted to modules');
  console.log('   • No manual section configuration required');
}
bootstrap(); 