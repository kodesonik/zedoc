import { Module, DynamicModule } from '@nestjs/common';
import { DocumentationService } from './services/documentation.service';
import { DocumentationController } from './controllers/documentation.controller';
import { DocumentationConfig } from './interfaces/documentation.interface';

@Module({})
export class ZedocModule {
  static forRoot(config?: DocumentationConfig): DynamicModule {
    return {
      module: ZedocModule,
      providers: [
        DocumentationService,
        {
          provide: 'DOCUMENTATION_CONFIG',
          useValue: config || {},
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService],
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
        {
          provide: 'DOCUMENTATION_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      controllers: [DocumentationController],
      exports: [DocumentationService],
      global: true,
    };
  }
} 