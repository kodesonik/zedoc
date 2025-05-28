import { Module, DynamicModule } from '@nestjs/common';
import { StructuredDocumentationService } from './services/structured-documentation.service';
import { ThemeService } from './services/theme.service';
import { SidebarService } from './services/sidebar.service';
import { FontService } from './services/font.service';
import { EnvironmentService } from './services/environment.service';
import { BrandingService } from './services/branding.service';
import { StructuredDocumentationController } from './controllers/structured-documentation.controller';
import { NewDocumentationConfig } from './interfaces/documentation.interface';

@Module({})
export class StructuredZedocModule {
  static forRoot(config?: NewDocumentationConfig): DynamicModule {
    return {
      module: StructuredZedocModule,
      providers: [
        StructuredDocumentationService,
        ThemeService,
        SidebarService,
        FontService,
        EnvironmentService,
        BrandingService,
        {
          provide: 'STRUCTURED_DOCUMENTATION_CONFIG',
          useValue: config || {
            title: 'API Documentation',
            description: 'Structured API Documentation',
            sections: []
          },
        },
      ],
      controllers: [StructuredDocumentationController],
      exports: [StructuredDocumentationService, ThemeService, SidebarService, FontService, EnvironmentService, BrandingService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => NewDocumentationConfig | Promise<NewDocumentationConfig>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: StructuredZedocModule,
      providers: [
        StructuredDocumentationService,
        ThemeService,
        SidebarService,
        FontService,
        EnvironmentService,
        BrandingService,
        {
          provide: 'STRUCTURED_DOCUMENTATION_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      controllers: [StructuredDocumentationController],
      exports: [StructuredDocumentationService, ThemeService, SidebarService, FontService, EnvironmentService, BrandingService],
      global: true,
    };
  }

  /**
   * Helper method to configure structured documentation
   */
  static configure(app: any, config: NewDocumentationConfig): void {
    try {
      const structuredService = app.get(StructuredDocumentationService);
      if (structuredService) {
        structuredService.setConfig(config);
        console.log('✅ Structured documentation configured');
      }
    } catch (error) {
      console.warn('⚠️ Could not configure structured documentation:', error.message);
    }
  }
} 