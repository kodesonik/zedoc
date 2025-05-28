import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentationService } from '../services/documentation.service';
import { SwaggerIntegrationService } from '../services/swagger-integration.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(
    private readonly documentationService: DocumentationService,
    private readonly swaggerIntegrationService: SwaggerIntegrationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get unified API documentation' })
  async getDocumentation(@Res() res: Response): Promise<void> {
    try {
      const config = this.documentationService.getConfig();
      
      // Determine mode: if sections are provided, use structured mode
      if (config.sections && config.sections.length > 0) {
        // Structured mode - generate from configuration
        const html = this.documentationService.generateStructuredDocumentation();
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // Swagger mode - generate from Swagger document
        let swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
        
        // If no Swagger document found, use sample document
        if (!swaggerDoc) {
          swaggerDoc = this.swaggerIntegrationService.createSampleSwaggerDocument();
        }
        
        // Transform Swagger to endpoints and generate documentation
        const endpoints = this.documentationService.transformSwaggerToEndpoints(swaggerDoc);
        const html = this.documentationService.generateDocumentation(endpoints);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      }
    } catch (error) {
      console.error('Error generating documentation:', error);
      res.status(500).send('Error generating documentation');
    }
  }

  @Get('config')
  @ApiOperation({ summary: 'Get documentation configuration' })
  getConfig() {
    return this.documentationService.getConfig();
  }

  @Get('json')
  @ApiOperation({ summary: 'Get Swagger JSON (Swagger mode only)' })
  async getSwaggerJson(@Res() res: Response): Promise<void> {
    try {
      let swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
      
      // If no Swagger document found, use sample document
      if (!swaggerDoc) {
        swaggerDoc = this.swaggerIntegrationService.createSampleSwaggerDocument();
      }
      
      res.json(swaggerDoc);
    } catch (error) {
      console.error('Error getting Swagger JSON:', error);
      res.status(500).json({ error: 'Error getting Swagger JSON' });
    }
  }

  @Get('endpoints')
  @ApiOperation({ summary: 'Get transformed endpoints (Swagger mode only)' })
  async getEndpoints(@Res() res: Response): Promise<void> {
    try {
      let swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
      
      // If no Swagger document found, use sample document
      if (!swaggerDoc) {
        swaggerDoc = this.swaggerIntegrationService.createSampleSwaggerDocument();
      }
      
      const endpoints = this.documentationService.transformSwaggerToEndpoints(swaggerDoc);
      res.json(endpoints);
    } catch (error) {
      console.error('Error getting endpoints:', error);
      res.status(500).json({ error: 'Error getting endpoints' });
    }
  }
} 