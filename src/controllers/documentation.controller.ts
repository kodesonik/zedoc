import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentationService } from '../services/documentation.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Documentation')
@Controller('docs')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get()
  @ApiOperation({ summary: 'Get API documentation' })
  getDocumentation(@Res() res: Response): void {
    // This would typically extract endpoints from your application
    // For now, we'll use a sample endpoint
    const sampleEndpoints = [
      {
        method: 'GET',
        path: '/api/users',
        summary: 'Get all users',
        description: 'Retrieve a list of all users in the system',
        tags: ['Users'],
        parameters: [
          {
            name: 'page',
            type: 'number',
            required: false,
            description: 'Page number for pagination',
            in: 'query' as const,
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Number of items per page',
            in: 'query' as const,
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Successfully retrieved users',
          },
          {
            statusCode: 400,
            description: 'Bad request',
          },
        ],
      },
    ];

    const html = this.documentationService.generateDocumentation(sampleEndpoints);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
} 