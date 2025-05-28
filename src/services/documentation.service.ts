import { Injectable, Inject } from '@nestjs/common';
import { 
  DocumentationConfig, 
  TemplateData, 
  EndpointInfo, 
  ParameterInfo, 
  ResponseInfo,
  UnifiedTemplateData,
  SectionConfig,
  ModuleConfig,
  EndpointConfig,
  ApiEndpoint,
  ErrorResponse
} from '../interfaces/documentation.interface';
import { ThemeService } from './theme.service';
import { SidebarService } from './sidebar.service';
import { FontService } from './font.service';
import { EnvironmentService } from './environment.service';
import { BrandingService } from './branding.service';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentationService {
  private config: DocumentationConfig = {};

  constructor(
    @Inject('DOCUMENTATION_CONFIG') config: DocumentationConfig,
    private readonly themeService: ThemeService,
    private readonly sidebarService: SidebarService,
    private readonly fontService: FontService,
    private readonly environmentService: EnvironmentService,
    private readonly brandingService: BrandingService,
  ) {
    this.config = { ...this.config, ...config };
    this.setupHandlebars();
  }

  setConfig(config: DocumentationConfig): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DocumentationConfig {
    return this.config;
  }

  /**
   * Determine the documentation mode based on configuration
   */
  private getDocumentationMode(): 'swagger' | 'structured' {
    if (this.config.mode === 'swagger') return 'swagger';
    if (this.config.mode === 'structured') return 'structured';
    
    // Auto-detect: if sections are provided, use structured mode
    if (this.config.sections && this.config.sections.length > 0) {
      return 'structured';
    }
    
    // Default to swagger mode
    return 'swagger';
  }

  private setupHandlebars(): void {
    // Register Handlebars helpers
    hbs.registerHelper('eq', (a: any, b: any) => a === b);
    hbs.registerHelper('uppercase', (str: string) => str?.toUpperCase());
    hbs.registerHelper('lowercase', (str: string) => str?.toLowerCase());
    hbs.registerHelper('json', (obj: any) => JSON.stringify(obj, null, 2));
    hbs.registerHelper('formatTags', (tags: string | string[]) => {
      if (Array.isArray(tags)) {
        return tags.join(', ');
      }
      return tags || '';
    });
    
    // Theme-related helpers
    hbs.registerHelper('themeClass', (className: string, context: any) => {
      const themeClasses = this.themeService.getThemeClasses(context.data.root.theme);
      return themeClasses[className] || '';
    });
    
    hbs.registerHelper('themeCSS', (context: any) => {
      return new hbs.SafeString(this.themeService.generateThemeCSS(context.data.root.theme));
    });
    
    hbs.registerHelper('methodColors', (context: any) => {
      return new hbs.SafeString(this.themeService.generateMethodColors(context.data.root.theme));
    });

    // Font-related helpers
    hbs.registerHelper('fontCSS', (context: any) => {
      return new hbs.SafeString(this.fontService.generateFontCSS(context.data.root.theme?.fonts));
    });

    hbs.registerHelper('responsiveFontCSS', (context: any) => {
      return new hbs.SafeString(this.fontService.generateResponsiveFontCSS(context.data.root.theme?.fonts));
    });

    hbs.registerHelper('fontClass', (className: string, context: any) => {
      const fontClasses = this.fontService.getFontClasses(context.data.root.theme?.fonts);
      return fontClasses[className] || '';
    });

    // Sidebar-related helpers (Swagger mode)
    hbs.registerHelper('sidebarHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const endpoints = context.data.root.endpoints || [];
      const tags = context.data.root.tags || [];
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.sidebarService.generateSidebarHTML(sidebarConfig, endpoints, tags, brandingConfig));
    });

    // Structured sidebar helper
    hbs.registerHelper('structuredSidebarHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const sections = context.data.root.sections || [];
      const tags = this.extractTagsFromSections(sections);
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.generateStructuredSidebarHTML(sidebarConfig, sections, tags, brandingConfig));
    });

    hbs.registerHelper('tryPanelHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const environmentConfig = context.data.root.environment;
      return new hbs.SafeString(this.sidebarService.generateTryPanelHTML(sidebarConfig.try!, environmentConfig));
    });

    hbs.registerHelper('sidebarCSS', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      return new hbs.SafeString(this.sidebarService.generateSidebarCSS(sidebarConfig));
    });

    hbs.registerHelper('sidebarJS', () => {
      return new hbs.SafeString(this.sidebarService.generateSidebarJS());
    });

    // Environment-related helpers
    hbs.registerHelper('environmentHTML', (context: any) => {
      const environmentConfig = context.data.root.environment;
      return new hbs.SafeString(this.environmentService.generateEnvironmentHTML(environmentConfig));
    });

    hbs.registerHelper('environmentJS', () => {
      return new hbs.SafeString(this.environmentService.generateEnvironmentJS());
    });

    // Branding-related helpers
    hbs.registerHelper('faviconHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateFaviconHTML(brandingConfig));
    });

    hbs.registerHelper('headerLogoHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateHeaderLogoHTML(brandingConfig));
    });

    hbs.registerHelper('coverHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateCoverHTML(brandingConfig));
    });

    hbs.registerHelper('brandingCSS', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateBrandingCSS(brandingConfig));
    });

    // Swagger mode helpers
    hbs.registerHelper('endpointId', (endpoint: EndpointInfo) => {
      return `endpoint-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    });

    // Structured mode helpers
    hbs.registerHelper('structuredEndpointId', (sectionId: string, moduleId: string, endpoint: EndpointConfig) => {
      return `endpoint-${sectionId}-${moduleId}-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    });

    hbs.registerHelper('moduleId', (sectionId: string, moduleId: string) => {
      return `module-${sectionId}-${moduleId}`;
    });

    hbs.registerHelper('sectionId', (sectionId: string) => {
      return `section-${sectionId}`;
    });

    hbs.registerHelper('authBadge', (requiresAuth: boolean) => {
      if (requiresAuth) {
        return new hbs.SafeString('<span class="auth-required-badge">🔒 Auth Required</span>');
      }
      return '';
    });

    hbs.registerHelper('formatErrorResponses', (errorResponses: any[]) => {
      if (!errorResponses || errorResponses.length === 0) return '';
      
      return errorResponses.map(error => `
        <div class="error-response">
          <span class="error-status">${error.status}</span>
          <span class="error-description">${error.description}</span>
          ${error.error ? `<div class="error-code">${error.error}</div>` : ''}
          ${error.message ? `<div class="error-message">${error.message}</div>` : ''}
        </div>
      `).join('');
    });
  }

  /**
   * Transform Swagger API JSON to our custom format
   */
  transformSwaggerToEndpoints(swaggerDoc: any): EndpointInfo[] {
    const endpoints: EndpointInfo[] = [];
    
    if (!swaggerDoc.paths) {
      return endpoints;
    }

    Object.keys(swaggerDoc.paths).forEach(path => {
      const pathItem = swaggerDoc.paths[path];
      
      Object.keys(pathItem).forEach(method => {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
          const operation = pathItem[method];
          
          const endpoint: EndpointInfo = {
            method: method.toUpperCase(),
            path: path,
            summary: operation.summary || '',
            description: operation.description || '',
            tags: operation.tags || [],
            parameters: this.transformParameters(operation.parameters || [], operation.requestBody),
            responses: this.transformResponses(operation.responses || {}),
          };
          
          endpoints.push(endpoint);
        }
      });
    });

    return endpoints;
  }

  private transformParameters(parameters: any[], requestBody?: any): ParameterInfo[] {
    const params: ParameterInfo[] = [];

    // Transform standard parameters
    parameters.forEach(param => {
      params.push({
        name: param.name,
        type: this.getParameterType(param.schema || param),
        required: param.required || false,
        description: param.description || '',
        in: param.in as 'query' | 'path' | 'header' | 'body',
      });
    });

    // Transform request body if present
    if (requestBody) {
      const content = requestBody.content;
      if (content) {
        Object.keys(content).forEach(mediaType => {
          params.push({
            name: 'body',
            type: mediaType,
            required: requestBody.required || false,
            description: requestBody.description || 'Request body',
            in: 'body',
          });
        });
      }
    }

    return params;
  }

  private transformResponses(responses: any): ResponseInfo[] {
    const responseList: ResponseInfo[] = [];

    Object.keys(responses).forEach(statusCode => {
      const response = responses[statusCode];
      responseList.push({
        statusCode: parseInt(statusCode),
        description: response.description || '',
        schema: response.content || response.schema,
      });
    });

    return responseList;
  }

  private getParameterType(schema: any): string {
    if (!schema) return 'unknown';
    
    if (schema.type) {
      return schema.type;
    }
    
    if (schema.$ref) {
      // Extract type name from $ref
      const refParts = schema.$ref.split('/');
      return refParts[refParts.length - 1];
    }
    
    return 'object';
  }

  /**
   * Generate documentation from Swagger API JSON
   */
  generateDocumentationFromSwagger(swaggerDoc: any): string {
    const endpoints = this.transformSwaggerToEndpoints(swaggerDoc);
    const tags = this.sidebarService.extractTags(endpoints);
    
    const templateData: TemplateData = {
      title: this.config.title || swaggerDoc.info?.title || 'API Documentation',
      description: this.config.description || swaggerDoc.info?.description,
      version: this.config.version || swaggerDoc.info?.version || '1.0.0',
      endpoints,
      theme: this.config.theme,
      sidebar: this.config.sidebar,
      environment: this.config.environment,
      branding: this.config.branding,
      tags,
    };

    const templatePath = path.join(__dirname, '../templates/documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }

  /**
   * Generate documentation (unified method supporting both modes)
   */
  generateDocumentation(endpoints?: EndpointInfo[]): string {
    const mode = this.getDocumentationMode();
    
    if (mode === 'structured') {
      return this.generateStructuredDocumentation();
    }
    
    // Swagger mode
    const tags = this.extractTagsFromEndpoints(endpoints || []);
    
    const templateData: UnifiedTemplateData = {
      title: this.config.title || 'API Documentation',
      description: this.config.description,
      version: this.config.version || '1.0.0',
      mode: 'swagger',
      endpoints: endpoints,
      theme: this.config.theme,
      sidebar: this.config.sidebar,
      environment: this.config.environment,
      branding: this.config.branding,
      tags,
    };

    const templatePath = path.join(__dirname, '../templates/unified-documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }

  /**
   * Extract tags from endpoints (for Swagger mode)
   */
  private extractTagsFromEndpoints(endpoints: EndpointInfo[]): string[] {
    const tagsSet = new Set<string>();
    
    endpoints.forEach(endpoint => {
      if (endpoint.tags) {
        endpoint.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet).sort();
  }

  private loadTemplate(templatePath: string): string {
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Fallback to default unified template if file doesn't exist
      return this.getDefaultUnifiedTemplate();
    }
  }

  private getDefaultUnifiedTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    {{{faviconHTML}}}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        {{{fontCSS}}}
        {{{responsiveFontCSS}}}
        {{{themeCSS}}}
        {{{methodColors}}}
        {{{sidebarCSS}}}
        {{{brandingCSS}}}
        
        /* Structured Documentation Styles */
        .section-card {
          margin-bottom: 3rem;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .section-header {
          padding: 2rem;
          background: linear-gradient(135deg, var(--zedoc-primary, #3b82f6), var(--zedoc-secondary, #1e40af));
          color: white;
        }
        
        .module-card {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          border: 1px solid var(--zedoc-border, #e2e8f0);
          overflow: hidden;
        }
        
        .module-header {
          padding: 1.5rem;
          background: var(--zedoc-surface, #f8fafc);
          border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
        }
        
        .endpoint-card {
          margin: 1rem 0;
          border-radius: 0.5rem;
          border: 1px solid var(--zedoc-border, #e2e8f0);
          overflow: hidden;
        }
        
        .endpoint-header {
          padding: 1rem 1.5rem;
          background: var(--zedoc-background, #ffffff);
          border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .auth-required-badge {
          background: var(--zedoc-warning, #f59e0b);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .error-response {
          margin: 0.5rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          background: var(--zedoc-surface, #f8fafc);
          border-left: 4px solid var(--zedoc-danger, #ef4444);
        }
        
        .error-status {
          font-weight: 600;
          color: var(--zedoc-danger, #ef4444);
        }
        
        .error-description {
          margin-left: 1rem;
          color: var(--zedoc-text, #1e293b);
        }
        
        .error-code, .error-message {
          margin-top: 0.5rem;
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--zedoc-text-secondary, #64748b);
        }
        
        /* Sidebar structured styles */
        .section-group {
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--zedoc-text, #1e293b);
          margin: 0 0 0.75rem 0;
          padding: 0.5rem 0;
          border-bottom: 2px solid var(--zedoc-primary, #3b82f6);
        }
        
        .module-group {
          margin-bottom: 1rem;
        }
        
        .module-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--zedoc-text-secondary, #64748b);
          margin: 0 0 0.5rem 0;
          padding-left: 0.5rem;
        }
        
        .module-endpoints {
          margin-left: 1rem;
        }
        
        /* Endpoint highlighting */
        .endpoint-card.highlighted {
          border-color: var(--zedoc-primary, #3b82f6) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
    </style>
</head>
<body class="{{themeClass 'body'}} min-h-screen">
    {{{coverHTML}}}
    
    {{#if (eq mode 'structured')}}
    {{{structuredSidebarHTML}}}
    {{else}}
    {{{sidebarHTML}}}
    {{/if}}
    
    {{{tryPanelHTML}}}
    
    <div class="main-content container mx-auto px-4 py-8 max-w-6xl {{themeClass 'container'}}">
        <header class="mb-12 text-center">
            <div class="flex items-center justify-center mb-6">
              {{{headerLogoHTML}}}
              {{#unless branding.logo.src}}
              <h1 class="{{fontClass 'title'}} {{themeClass 'header'}}">{{title}}</h1>
              {{/unless}}
            </div>
            {{#if branding.logo.src}}
            <h1 class="{{fontClass 'title'}} mb-4 {{themeClass 'header'}}">{{title}}</h1>
            {{/if}}
            {{#if description}}
            <p class="{{fontClass 'subtitle'}} mb-4 {{themeClass 'textSecondary'}}">{{description}}</p>
            {{/if}}
            {{#if version}}
            <span class="inline-block bg-blue-500 text-white {{fontClass 'badge'}} px-4 py-2 rounded-full">Version {{version}}</span>
            {{/if}}
        </header>

        {{#if (eq mode 'structured')}}
        <!-- Structured Documentation Layout -->
        <div class="sections-container">
            {{#each sections}}
            <div id="{{sectionId id}}" class="section-card {{themeClass 'card'}}">
                <div class="section-header">
                    <h2 class="{{fontClass 'heading1'}} text-white">{{name}}</h2>
                    {{#if description}}
                    <p class="{{fontClass 'subtitle'}} text-white opacity-90 mt-2">{{description}}</p>
                    {{/if}}
                </div>
                
                <div class="section-content p-6">
                    {{#each modules}}
                    <div id="{{moduleId ../id id}}" class="module-card">
                        <div class="module-header">
                            <h3 class="{{fontClass 'heading2'}} {{themeClass 'text'}}">{{name}}</h3>
                            {{#if description}}
                            <p class="{{fontClass 'body'}} {{themeClass 'textSecondary'}} mt-2">{{description}}</p>
                            {{/if}}
                        </div>
                        
                        <div class="module-endpoints p-4">
                            {{#each endpoints}}
                            <div id="{{structuredEndpointId ../../id ../id this}}" class="endpoint-card">
                                <div class="endpoint-header">
                                    <span class="inline-block px-4 py-2 {{fontClass 'badge'}} rounded-lg method-{{lowercase method}}">
                                        {{method}}
                                    </span>
                                    <code class="{{fontClass 'code'}} px-3 py-1 rounded {{themeClass 'surface'}} {{themeClass 'text'}}">{{path}}</code>
                                    {{{authBadge requiresAuth}}}
                                </div>
                                
                                <div class="endpoint-content p-6">
                                    <h4 class="{{fontClass 'heading3'}} mb-3 {{themeClass 'text'}}">{{summary}}</h4>
                                    
                                    {{#if description}}
                                    <p class="{{fontClass 'body'}} mb-6 leading-relaxed {{themeClass 'textSecondary'}}">{{description}}</p>
                                    {{/if}}

                                    {{#if tags}}
                                    <div class="mb-6">
                                        <h5 class="{{fontClass 'label'}} uppercase tracking-wide mb-2 {{themeClass 'textSecondary'}}">Tags</h5>
                                        <div class="flex flex-wrap gap-2">
                                            <span class="inline-block {{fontClass 'badge'}} px-3 py-1 rounded-full {{themeClass 'badge'}}">{{formatTags tags}}</span>
                                        </div>
                                    </div>
                                    {{/if}}

                                    {{#if additionalHeaders}}
                                    <div class="mb-6">
                                        <h5 class="{{fontClass 'heading5'}} mb-3 {{themeClass 'text'}}">Additional Headers</h5>
                                        <pre class="{{fontClass 'code'}} p-3 rounded {{themeClass 'surface'}} {{themeClass 'text'}} overflow-x-auto">{{json additionalHeaders}}</pre>
                                    </div>
                                    {{/if}}

                                    {{#if requestBody}}
                                    <div class="mb-6">
                                        <h5 class="{{fontClass 'heading5'}} mb-3 {{themeClass 'text'}}">Request Body</h5>
                                        <pre class="{{fontClass 'code'}} p-3 rounded {{themeClass 'surface'}} {{themeClass 'text'}} overflow-x-auto">{{json requestBody}}</pre>
                                    </div>
                                    {{/if}}

                                    {{#if successData}}
                                    <div class="mb-6">
                                        <h5 class="{{fontClass 'heading5'}} mb-3 {{themeClass 'text'}}">Success Response</h5>
                                        <div class="p-4 rounded-lg {{themeClass 'surface'}}">
                                            {{#if successStatus}}
                                            <span class="inline-block px-3 py-1 {{fontClass 'code'}} rounded border mr-4 text-center {{themeClass 'card'}} {{themeClass 'text'}} {{themeClass 'border'}}">{{successStatus}}</span>
                                            {{/if}}
                                            {{#if successMessage}}
                                            <p class="{{fontClass 'body'}} {{themeClass 'text'}} mb-3">{{successMessage}}</p>
                                            {{/if}}
                                            <pre class="{{fontClass 'code'}} p-3 rounded {{themeClass 'card'}} {{themeClass 'text'}} overflow-x-auto">{{json successData}}</pre>
                                        </div>
                                    </div>
                                    {{/if}}

                                    {{#if errorResponses}}
                                    <div class="mb-6">
                                        <h5 class="{{fontClass 'heading5'}} mb-3 {{themeClass 'text'}}">Error Responses</h5>
                                        <div class="space-y-3">
                                            {{#each errorResponses}}
                                            <div class="error-response">
                                                <div class="flex items-center gap-3 mb-2">
                                                    <span class="error-status {{fontClass 'code'}}">{{status}}</span>
                                                    <span class="error-description {{fontClass 'body'}}">{{description}}</span>
                                                </div>
                                                {{#if error}}
                                                <div class="error-code">Error: {{error}}</div>
                                                {{/if}}
                                                {{#if message}}
                                                <div class="error-message">Message: {{message}}</div>
                                                {{/if}}
                                            </div>
                                            {{/each}}
                                        </div>
                                    </div>
                                    {{/if}}
                                </div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                    {{/each}}
                </div>
            </div>
            {{/each}}
        </div>
        {{else}}
        <!-- Swagger Documentation Layout -->
        <div class="space-y-8">
            {{#each endpoints}}
            <div id="{{endpointId this}}" class="endpoint-card {{themeClass 'card'}} rounded-xl shadow-lg border overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center mb-6">
                        <span class="inline-block px-4 py-2 {{fontClass 'badge'}} rounded-lg method-{{lowercase method}}">
                            {{method}}
                        </span>
                        <code class="ml-4 {{fontClass 'code'}} px-3 py-1 rounded {{themeClass 'surface'}} {{themeClass 'text'}}">{{path}}</code>
                    </div>
                    
                    {{#if summary}}
                    <h3 class="{{fontClass 'heading2'}} mb-3 {{themeClass 'text'}}">{{summary}}</h3>
                    {{/if}}
                    
                    {{#if description}}
                    <p class="{{fontClass 'body'}} mb-6 leading-relaxed {{themeClass 'textSecondary'}}">{{description}}</p>
                    {{/if}}

                    {{#if tags}}
                    <div class="mb-6">
                        <h4 class="{{fontClass 'label'}} uppercase tracking-wide mb-2 {{themeClass 'textSecondary'}}">Tags</h4>
                        <div class="flex flex-wrap gap-2">
                            {{#each tags}}
                            <span class="inline-block {{fontClass 'badge'}} px-3 py-1 rounded-full {{themeClass 'badge'}}">{{this}}</span>
                            {{/each}}
                        </div>
                    </div>
                    {{/if}}

                    {{#if parameters}}
                    <div class="mb-6">
                        <h4 class="{{fontClass 'heading4'}} mb-4 {{themeClass 'text'}}">Parameters</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full rounded-lg {{themeClass 'surface'}}">
                                <thead>
                                    <tr class="{{themeClass 'surface'}}">
                                        <th class="px-6 py-3 text-left {{fontClass 'label'}} uppercase tracking-wider {{themeClass 'textSecondary'}}">Name</th>
                                        <th class="px-6 py-3 text-left {{fontClass 'label'}} uppercase tracking-wider {{themeClass 'textSecondary'}}">Type</th>
                                        <th class="px-6 py-3 text-left {{fontClass 'label'}} uppercase tracking-wider {{themeClass 'textSecondary'}}">In</th>
                                        <th class="px-6 py-3 text-left {{fontClass 'label'}} uppercase tracking-wider {{themeClass 'textSecondary'}}">Required</th>
                                        <th class="px-6 py-3 text-left {{fontClass 'label'}} uppercase tracking-wider {{themeClass 'textSecondary'}}">Description</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y {{themeClass 'border'}}">
                                    {{#each parameters}}
                                    <tr class="hover:{{themeClass 'surface'}}">
                                        <td class="px-6 py-4 whitespace-nowrap {{fontClass 'code'}} {{themeClass 'text'}}">{{name}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 rounded {{fontClass 'badge'}} {{themeClass 'badge'}}">{{type}}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap {{fontClass 'bodySmall'}} {{themeClass 'textSecondary'}}">{{in}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap {{fontClass 'bodySmall'}}">
                                            {{#if required}}
                                            <span class="text-red-600 zedoc-font-medium">Required</span>
                                            {{else}}
                                            <span class="{{themeClass 'textSecondary'}}">Optional</span>
                                            {{/if}}
                                        </td>
                                        <td class="px-6 py-4 {{fontClass 'bodySmall'}} {{themeClass 'textSecondary'}}">{{description}}</td>
                                    </tr>
                                    {{/each}}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {{/if}}

                    {{#if responses}}
                    <div>
                        <h4 class="{{fontClass 'heading4'}} mb-4 {{themeClass 'text'}}">Responses</h4>
                        <div class="space-y-3">
                            {{#each responses}}
                            <div class="flex items-start p-4 rounded-lg {{themeClass 'surface'}}">
                                <span class="inline-block px-3 py-1 {{fontClass 'code'}} rounded border mr-4 min-w-[60px] text-center {{themeClass 'card'}} {{themeClass 'text'}} {{themeClass 'border'}}">{{statusCode}}</span>
                                <div class="flex-1">
                                    <span class="{{fontClass 'body'}} zedoc-font-medium {{themeClass 'text'}}">{{description}}</span>
                                    {{#if schema}}
                                    <pre class="mt-2 {{fontClass 'caption'}} p-2 rounded border overflow-x-auto {{themeClass 'card'}} {{themeClass 'textSecondary'}} {{themeClass 'border'}}"><code>{{json schema}}</code></pre>
                                    {{/if}}
                                </div>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                    {{/if}}
                </div>
            </div>
            {{/each}}
        </div>
        {{/if}}

        <footer class="mt-16 text-center {{fontClass 'bodySmall'}} {{themeClass 'textSecondary'}}">
            <p>Generated with ❤️ by <strong>@kodesonik/zedoc</strong></p>
        </footer>
    </div>

    {{{sidebarJS}}}
</body>
</html>
    `;
  }

  /**
   * Extract tags from all sections and modules
   */
  private extractTagsFromSections(sections: SectionConfig[]): string[] {
    const tagsSet = new Set<string>();
    
    sections.forEach(section => {
      section.modules.forEach(module => {
        module.endpoints.forEach(endpoint => {
          if (endpoint.tags) {
            if (Array.isArray(endpoint.tags)) {
              endpoint.tags.forEach(tag => tagsSet.add(tag));
            } else {
              tagsSet.add(endpoint.tags);
            }
          }
        });
      });
    });
    
    return Array.from(tagsSet).sort();
  }

  /**
   * Generate structured sidebar HTML
   */
  private generateStructuredSidebarHTML(sidebarConfig: any, sections: SectionConfig[], tags: string[], brandingConfig?: any): string {
    if (sidebarConfig.position === 'none') {
      return '';
    }

    const sidebarClass = `sidebar-${sidebarConfig.position}`;
    const collapsibleClass = sidebarConfig.collapsible ? 'collapsible' : '';
    const sidebarLogo = this.brandingService.generateSidebarLogoHTML(brandingConfig);

    let sectionsHTML = '';
    sections.forEach(section => {
      sectionsHTML += `
        <div class="section-group" data-section="${section.id}">
          <h3 class="section-title">${section.name}</h3>
          <div class="section-modules">
      `;
      
      section.modules.forEach(module => {
        sectionsHTML += `
          <div class="module-group" data-module="${module.id}">
            <h4 class="module-title">${module.name}</h4>
            <div class="module-endpoints">
        `;
        
        module.endpoints.forEach(endpoint => {
          const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
          const authIcon = endpoint.requiresAuth ? '🔒 ' : '';
          sectionsHTML += `
            <a href="#endpoint-${section.id}-${module.id}-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}" 
               class="endpoint-link" 
               data-method="${endpoint.method}" 
               data-path="${endpoint.path}"
               data-requires-auth="${endpoint.requiresAuth}">
              <span class="endpoint-title">${authIcon}${title}</span>
            </a>
          `;
        });
        
        sectionsHTML += `
            </div>
          </div>
        `;
      });
      
      sectionsHTML += `
          </div>
        </div>
      `;
    });

    return `
      <div id="zedoc-sidebar" class="${sidebarClass} ${collapsibleClass}" style="width: ${sidebarConfig.width}">
        ${sidebarLogo}
        <div class="sidebar-header">
          <h3 class="sidebar-title">API Navigation</h3>
          ${sidebarConfig.collapsible ? '<button id="sidebar-toggle" class="sidebar-toggle">×</button>' : ''}
        </div>
        
        <div class="sidebar-content">
          ${sidebarConfig.searchbar ? this.generateSearchBar() : ''}
          ${sidebarConfig.tagsFilter ? this.generateTagsFilter(tags) : ''}
          <div class="sections-list">
            ${sectionsHTML}
          </div>
        </div>
      </div>
    `;
  }

  private generateSearchBar(): string {
    return `
      <div class="search-section">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            id="endpoint-search" 
            placeholder="Search endpoints..." 
            class="search-input"
          />
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
    `;
  }

  private generateTagsFilter(tags: string[]): string {
    if (tags.length === 0) return '';

    const tagOptions = tags.map(tag => 
      `<label class="tag-filter-item">
        <input type="checkbox" value="${tag}" checked> 
        <span class="tag-name">${tag}</span>
      </label>`
    ).join('');

    return `
      <div class="tags-filter-section">
        <h4 class="filter-title">Filter by Tags</h4>
        <div class="tags-filter-list">
          ${tagOptions}
        </div>
      </div>
    `;
  }

  /**
   * Convert EndpointConfig to ApiEndpoint format
   */
  convertEndpointConfigToApiEndpoint(endpoint: EndpointConfig): ApiEndpoint {
    return {
      method: endpoint.method,
      path: endpoint.path,
      summary: endpoint.summary,
      description: endpoint.description,
      requiresAuth: endpoint.requiresAuth || false,
      tags: endpoint.tags || [],
      requestHeaders: endpoint.additionalHeaders,
      requestBody: endpoint.requestBody,
      successResponse: endpoint.successData,
      responseExample: endpoint.successMessage,
      errorResponses: endpoint.errorResponses?.map(err => ({
        status: err.status,
        description: err.description,
        example: { error: err.error, message: err.message }
      }))
    };
  }

  /**
   * Generate documentation from structured configuration
   */
  generateStructuredDocumentation(): string {
    const tags = this.extractTagsFromSections(this.config.sections || []);
    
    const templateData: UnifiedTemplateData = {
      title: this.config.title || 'API Documentation',
      description: this.config.description,
      version: this.config.version,
      mode: 'structured',
      sections: this.config.sections,
      theme: this.config.theme,
      sidebar: this.config.sidebar,
      environment: this.config.environment,
      branding: this.config.branding,
      tags,
    };

    const templatePath = path.join(__dirname, '../templates/unified-documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }
} 