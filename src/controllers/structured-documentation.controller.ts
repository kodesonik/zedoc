import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { StructuredDocumentationService } from '../services/structured-documentation.service';

@Controller('structured-docs')
export class StructuredDocumentationController {
  constructor(
    private readonly structuredDocumentationService: StructuredDocumentationService,
  ) {}

  @Get()
  getStructuredDocumentation(@Res() res: Response): void {
    const html = this.structuredDocumentationService.generateStructuredDocumentation();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('config')
  getStructuredConfig() {
    return this.structuredDocumentationService.getConfig();
  }
} 