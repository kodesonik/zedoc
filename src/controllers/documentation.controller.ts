import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { DocumentationService } from '../services/documentation.service';
import { SwaggerIntegrationService } from '../services/swagger-integration.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(
    private readonly documentationService: DocumentationService,
    private readonly swaggerIntegrationService: SwaggerIntegrationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get unified API documentation' })
  @ApiQuery({ name: 'theme', required: false, enum: ['light', 'dark'], description: 'Theme mode for the documentation' })
  @ApiQuery({ name: 'preset', required: false, enum: ['default', 'postman', 'insomnia', 'swagger', 'custom'], description: 'Theme preset for the documentation' })
  async getDocumentation(
    @Res() res: Response,
    @Query('theme') theme?: 'light' | 'dark',
    @Query('preset') preset?: 'default' | 'postman' | 'insomnia' | 'swagger' | 'custom'
  ): Promise<void> {
    try {
      // Get Swagger document
      let swaggerDoc =
        await this.swaggerIntegrationService.getSwaggerDocument();

      // Automatically convert Swagger ApiTags to sections
      console.log('🔄 Converting Swagger ApiTags to structured sections');
      const sections =
        this.swaggerIntegrationService.convertSwaggerToSections(swaggerDoc);

      // Override theme configuration if query parameters are provided
      const currentConfig = this.documentationService.getConfig();
      const themeOverride = {
        ...currentConfig.theme,
        ...(theme && { mode: theme }),
        ...(preset && { preset: preset }),
      };

      console.log(`🎨 Theme configuration:`, {
        mode: themeOverride.mode || 'light',
        preset: themeOverride.preset || 'default',
        fromQuery: { theme, preset }
      });

      // Generate documentation with theme override
      const html = this.documentationService.generateDocumentation(
        swaggerDoc,
        sections,
        { theme: themeOverride }
      );

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
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
        let swaggerDoc =
          await this.swaggerIntegrationService.getSwaggerDocument();

        if (!swaggerDoc) {
          swaggerDoc =
            this.swaggerIntegrationService.createSampleSwaggerDocument();
        }

        const autoSections =
          this.swaggerIntegrationService.convertSwaggerToSections(swaggerDoc);

        res.json({
          ...config,
          mode: autoSections.length > 0 ? 'auto-structured' : 'swagger',
          sections: autoSections,
          _note:
            'Sections auto-generated from Swagger ApiTags and ApiOperation summaries',
        });
      } else {
        res.json({
          ...config,
          mode: 'manual-structured',
          _note: 'Using manually configured sections',
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
      let swaggerDoc =
        await this.swaggerIntegrationService.getSwaggerDocument();

      // If no Swagger document found, use sample document
      if (!swaggerDoc) {
        swaggerDoc =
          this.swaggerIntegrationService.createSampleSwaggerDocument();
      }

      res.json(swaggerDoc);
    } catch (error) {
      console.error('Error getting Swagger JSON:', error);
      res.status(500).json({ error: 'Error getting Swagger JSON' });
    }
  }
}
