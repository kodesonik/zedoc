import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed
  app.enableCors();

  // Setup Swagger for local endpoints
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

  // Option 1: Use local Swagger document (current approach)
  ZedocModule.setSwaggerDocument(app, document);
  
  // Option 2: Load from external URL (new feature demonstration)
  // Uncomment the following lines to test with the complex external API
  // try {
  //   console.log('🌐 Loading complex Swagger document from external API...');
  //   await ZedocModule.setSwaggerJson(app, 'https://api.staging.thecyrcle.com/v1/json', {
  //     timeout: 15000, // 15 seconds timeout
  //     headers: {
  //       'Accept': 'application/json',
  //       'User-Agent': '@kodesonik/zedoc-test'
  //     }
  //   });
  //   console.log('✅ External Swagger document loaded successfully!');
  // } catch (error) {
  //   console.warn('⚠️  Failed to load external Swagger document, using local document:', error.message);
  //   ZedocModule.setSwaggerDocument(app, document);
  // }

  // Option 3: Load from local file (alternative approach)
  // await ZedocModule.setSwaggerJson(app, './swagger.json');


  await app.listen(3000);
  
  console.log('🚀 Auto-structured test application is running on: http://localhost:3000');
  console.log('📚 Swagger UI available at: http://localhost:3000/api');
  console.log('📖 Auto-structured Zedoc documentation available at: http://localhost:3000/docs');
  console.log('⚙️ Configuration (showing auto-generated sections) available at: http://localhost:3000/docs/config');
  console.log('🔗 Swagger JSON available at: http://localhost:3000/api-json');
  console.log('🔗 Test external Swagger loading: http://localhost:3000/load-external-swagger');
  console.log('');
  console.log('✨ Features:');
  console.log('   • ApiTags automatically converted to sections');
  console.log('   • ApiOperation summaries automatically converted to modules');
  console.log('   • No manual section configuration required');
  console.log('   • Support for external Swagger documents via setSwaggerJson()');
  console.log('   • Complex schema resolution with $ref handling');
  console.log('   • Rich request/response examples extraction');
}

bootstrap(); 