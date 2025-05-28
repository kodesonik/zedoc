import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get hello message',
    description: 'Returns a simple hello world message'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successful response',
    type: String
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check if the application is running'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 123.456 }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('test-complex-api')
  @ApiOperation({ summary: 'Test complex API processing' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demonstrates processing of complex real-world Swagger document',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Complex API processing completed' },
        sectionsCount: { type: 'number', example: 5 },
        modulesCount: { type: 'number', example: 15 },
        endpointsCount: { type: 'number', example: 45 },
        features: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Schema reference resolution',
            'Complex request/response examples',
            'Authentication detection',
            'Error response extraction',
            'Parameter processing'
          ]
        }
      }
    }
  })
  async testComplexApi() {
    try {
      // Fetch the complex Swagger document
      const response = await fetch('https://api.staging.thecyrcle.com/v1/json');
      const swaggerDoc = await response.json();
      
      // Import the SwaggerIntegrationService to process it
      const { SwaggerIntegrationService } = await import('@kodesonik/zedoc');
      const swaggerService = new SwaggerIntegrationService();
      
      // Convert to structured sections
      const sections = swaggerService.convertSwaggerToSections(swaggerDoc);
      
      // Calculate statistics
      const sectionsCount = sections.length;
      const modulesCount = sections.reduce((acc, section) => acc + section.modules.length, 0);
      const endpointsCount = sections.reduce((acc, section) => 
        acc + section.modules.reduce((modAcc, module) => modAcc + module.endpoints.length, 0), 0
      );
      
      return {
        message: 'Complex API processing completed successfully',
        sectionsCount,
        modulesCount,
        endpointsCount,
        features: [
          'Schema reference resolution ($ref handling)',
          'Complex request/response examples extraction',
          'Authentication requirement detection',
          'Detailed error response processing',
          'Parameter extraction (query, path, header)',
          'Multiple content type support',
          'Nested object schema processing',
          'Circular reference handling',
          'Enum value processing',
          'Format-specific example generation'
        ],
        sampleSections: sections.slice(0, 2).map(section => ({
          name: section.name,
          modulesCount: section.modules.length,
          sampleEndpoints: section.modules.slice(0, 1).map(module => ({
            moduleName: module.name,
            endpoints: module.endpoints.slice(0, 2).map(endpoint => ({
              method: endpoint.method,
              path: endpoint.path,
              summary: endpoint.summary,
              hasRequestBody: !!endpoint.requestBody,
              hasParameters: endpoint.parameters && endpoint.parameters.length > 0,
              hasErrorResponses: endpoint.errorResponses && endpoint.errorResponses.length > 0,
              requiresAuth: endpoint.requiresAuth
            }))
          }))
        }))
      };
    } catch (error) {
      return {
        message: 'Error processing complex API',
        error: error.message,
        fallback: 'Using local Swagger document for demonstration'
      };
    }
  }
} 