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
      
      // Check if manual sections are provided in config
      if (config.sections && config.sections.length > 0) {
        // Manual structured mode - generate from configuration
        const html = this.documentationService.generateStructuredDocumentation();
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        return;
      }

      // Get Swagger document
      let swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
      
      // If no Swagger document found, use sample document
      if (!swaggerDoc) {
        swaggerDoc = this.swaggerIntegrationService.createSampleSwaggerDocument();
      }

      // Automatically convert Swagger ApiTags to sections
      const autoSections = this.swaggerIntegrationService.convertSwaggerToSections(swaggerDoc);
      
      if (autoSections.length > 0) {
        // Auto-structured mode - generate from converted sections
        console.log('🔄 Auto-converting Swagger ApiTags to structured sections');
        
        // Temporarily set the auto-generated sections in the config
        const originalConfig = this.documentationService.getConfig();
        this.documentationService.setConfig({
          ...originalConfig,
          sections: autoSections
        });
        
        const html = this.documentationService.generateStructuredDocumentation();
        
        // Restore original config
        this.documentationService.setConfig(originalConfig);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // Fallback to traditional Swagger mode
        console.log('📋 Using traditional Swagger mode');
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
  @ApiOperation({ summary: 'Get current configuration' })
  async getConfig(@Res() res: Response): Promise<void> {
    try {
      const config = this.documentationService.getConfig();
      
      // If no manual sections, show auto-generated sections from Swagger
      if (!config.sections || config.sections.length === 0) {
        let swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
        
        if (!swaggerDoc) {
          swaggerDoc = this.swaggerIntegrationService.createSampleSwaggerDocument();
        }
        
        const autoSections = this.swaggerIntegrationService.convertSwaggerToSections(swaggerDoc);
        
        res.json({
          ...config,
          mode: autoSections.length > 0 ? 'auto-structured' : 'swagger',
          sections: autoSections,
          _note: 'Sections auto-generated from Swagger ApiTags and ApiOperation summaries'
        });
      } else {
        res.json({
          ...config,
          mode: 'manual-structured',
          _note: 'Using manually configured sections'
        });
      }
    } catch (error) {
      console.error('Error getting configuration:', error);
      res.status(500).json({ error: 'Error getting configuration' });
    }
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