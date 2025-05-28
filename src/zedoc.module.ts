import { Module, DynamicModule } from '@nestjs/common';
import { DocumentationService } from './services/documentation.service';
import { SwaggerIntegrationService } from './services/swagger-integration.service';
import { ThemeService } from './services/theme.service';
import { SidebarService } from './services/sidebar.service';
import { FontService } from './services/font.service';
import { EnvironmentService } from './services/environment.service';
import { BrandingService } from './services/branding.service';
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
        ThemeService,
        SidebarService,
        FontService,
        EnvironmentService,
        BrandingService,
        {
          provide: 'DOCUMENTATION_CONFIG',
          useValue: config || {},
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService, SwaggerIntegrationService, ThemeService, SidebarService, FontService, EnvironmentService, BrandingService],
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
        ThemeService,
        SidebarService,
        FontService,
        EnvironmentService,
        BrandingService,
        {
          provide: 'DOCUMENTATION_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService, SwaggerIntegrationService, ThemeService, SidebarService, FontService, EnvironmentService, BrandingService],
      global: true,
    };
  }

  /**
   * Helper method to set the Swagger document (for Swagger mode)
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

  /**
   * Helper method to configure structured documentation (for structured mode)
   * Call this to update the configuration at runtime
   */
  static configure(app: any, config: DocumentationConfig): void {
    try {
      const documentationService = app.get(DocumentationService);
      if (documentationService) {
        documentationService.setConfig(config);
        console.log('✅ Zedoc configuration updated');
      }
    } catch (error) {
      console.warn('⚠️ Could not configure Zedoc:', error.message);
    }
  }
} 