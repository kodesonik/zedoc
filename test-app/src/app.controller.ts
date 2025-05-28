import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
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

  @Get('load-external-swagger')
  @ApiOperation({ summary: 'Load external Swagger document' })
  @ApiQuery({ 
    name: 'url', 
    required: false, 
    description: 'URL of the Swagger JSON document',
    example: 'https://api.staging.thecyrcle.com/v1/json'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'External Swagger document loaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'External Swagger document loaded successfully' },
        source: { type: 'string', example: 'https://api.staging.thecyrcle.com/v1/json' },
        info: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'External API' },
            version: { type: 'string', example: '1.0.0' },
            description: { type: 'string', example: 'External API description' },
            pathsCount: { type: 'number', example: 50 }
          }
        },
        sectionsGenerated: { type: 'number', example: 10 },
        modulesGenerated: { type: 'number', example: 25 },
        endpointsGenerated: { type: 'number', example: 50 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Failed to load external Swagger document' 
  })
  async loadExternalSwagger(@Query('url') url?: string) {
    try {
      // Import the SwaggerIntegrationService to process it
      const { SwaggerIntegrationService } = await import('@kodesonik/zedoc');
      const swaggerService = new SwaggerIntegrationService();
      
      // Use provided URL or default to the complex API
      const swaggerUrl = url || 'https://api.staging.thecyrcle.com/v1/json';
      
      // Load the external Swagger document
      await swaggerService.setSwaggerJson(swaggerUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@kodesonik/zedoc-test'
        }
      });
      
      // Get document info
      const info = swaggerService.getSwaggerInfo();
      
      // Get the document and convert to sections
      const swaggerDoc = await swaggerService.getSwaggerDocument();
      const sections = swaggerService.convertSwaggerToSections(swaggerDoc);
      
      // Calculate statistics
      const sectionsCount = sections.length;
      const modulesCount = sections.reduce((acc, section) => acc + section.modules.length, 0);
      const endpointsCount = sections.reduce((acc, section) => 
        acc + section.modules.reduce((modAcc, module) => modAcc + module.endpoints.length, 0), 0
      );
      
      return {
        message: 'External Swagger document loaded successfully',
        source: swaggerUrl,
        info: info || { title: 'Unknown', version: 'Unknown', description: 'No description', pathsCount: 0 },
        sectionsGenerated: sectionsCount,
        modulesGenerated: modulesCount,
        endpointsGenerated: endpointsCount,
        timestamp: new Date().toISOString(),
        features: [
          'URL-based Swagger document loading',
          'Automatic schema resolution',
          'Complex API structure processing',
          'Real-time section generation',
          'Error handling and validation'
        ]
      };
    } catch (error) {
      return {
        message: 'Failed to load external Swagger document',
        error: error.message,
        source: url || 'https://api.staging.thecyrcle.com/v1/json',
        timestamp: new Date().toISOString(),
        suggestion: 'Check if the URL is accessible and returns valid JSON'
      };
    }
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