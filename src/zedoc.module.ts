import { Module, DynamicModule } from '@nestjs/common';
import { DocumentationService } from './services/documentation.service';
import { SwaggerIntegrationService } from './services/swagger-integration.service';
import { DocumentationController } from './controllers/documentation.controller';
import { DocumentationConfig } from './interfaces/documentation.interface';

@Module({})
export class ZedocModule {
  static forRoot(config?: DocumentationConfig): DynamicModule {
    return {
      module: ZedocModule,
      providers: [
        DocumentationService,
        SwaggerIntegrationService,
        {
          provide: 'DOCUMENTATION_CONFIG',
          useValue: config || {},
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService, SwaggerIntegrationService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => DocumentationConfig | Promise<DocumentationConfig>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: ZedocModule,
      providers: [
        DocumentationService,
        SwaggerIntegrationService,
        {
          provide: 'DOCUMENTATION_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService, SwaggerIntegrationService],
      global: true,
    };
  }

  /**
   * Helper method to set the Swagger document
   * Call this after setting up Swagger in your application
   */
  static setSwaggerDocument(app: any, document: any): void {
    try {
      const swaggerService = app.get(SwaggerIntegrationService);
      if (swaggerService) {
        swaggerService.setSwaggerDocument(document);
        console.log('✅ Swagger document set for Zedoc');
      }
    } catch (error) {
      console.warn('⚠️ Could not set Swagger document for Zedoc:', error.message);
    }
  }
} 