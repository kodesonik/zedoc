import { Injectable, Inject } from '@nestjs/common';
import { DocumentationConfig, TemplateData, EndpointInfo, ParameterInfo, ResponseInfo } from '../interfaces/documentation.interface';
import { ThemeService } from './theme.service';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentationService {
  private config: DocumentationConfig = {};

  constructor(
    @Inject('DOCUMENTATION_CONFIG') config: DocumentationConfig,
    private readonly themeService: ThemeService,
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

  private setupHandlebars(): void {
    // Register Handlebars helpers
    hbs.registerHelper('eq', (a: any, b: any) => a === b);
    hbs.registerHelper('uppercase', (str: string) => str?.toUpperCase());
    hbs.registerHelper('lowercase', (str: string) => str?.toLowerCase());
    hbs.registerHelper('json', (obj: any) => JSON.stringify(obj, null, 2));
    
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
    
    const templateData: TemplateData = {
      title: this.config.title || swaggerDoc.info?.title || 'API Documentation',
      description: this.config.description || swaggerDoc.info?.description,
      version: this.config.version || swaggerDoc.info?.version || '1.0.0',
      endpoints,
      theme: this.config.theme,
    };

    const templatePath = path.join(__dirname, '../templates/documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }

  /**
   * Legacy method for backward compatibility
   */
  generateDocumentation(endpoints: EndpointInfo[]): string {
    const templateData: TemplateData = {
      title: this.config.title || 'API Documentation',
      description: this.config.description,
      version: this.config.version || '1.0.0',
      endpoints,
      theme: this.config.theme,
    };

    const templatePath = path.join(__dirname, '../templates/documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }

  private loadTemplate(templatePath: string): string {
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Fallback to default template if file doesn't exist
      return this.getDefaultTemplate();
    }
  }

  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        {{{themeCSS}}}
        {{{methodColors}}}
    </style>
</head>
<body class="{{themeClass 'body'}} min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl {{themeClass 'container'}}">
        <header class="mb-12 text-center">
            <h1 class="text-5xl font-bold mb-4 {{themeClass 'header'}}">{{title}}</h1>
            {{#if description}}
            <p class="text-xl mb-4 {{themeClass 'textSecondary'}}">{{description}}</p>
            {{/if}}
            {{#if version}}
            <span class="inline-block bg-blue-500 text-white text-sm px-4 py-2 rounded-full font-medium">Version {{version}}</span>
            {{/if}}
        </header>

        <div class="space-y-8">
            {{#each endpoints}}
            <div class="{{themeClass 'card'}} rounded-xl shadow-lg border overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center mb-6">
                        <span class="inline-block px-4 py-2 text-sm font-bold rounded-lg method-{{lowercase method}}">
                            {{method}}
                        </span>
                        <code class="ml-4 text-lg font-mono px-3 py-1 rounded {{themeClass 'surface'}} {{themeClass 'text'}}">{{path}}</code>
                    </div>
                    
                    {{#if summary}}
                    <h3 class="text-2xl font-semibold mb-3 {{themeClass 'text'}}">{{summary}}</h3>
                    {{/if}}
                    
                    {{#if description}}
                    <p class="mb-6 leading-relaxed {{themeClass 'textSecondary'}}">{{description}}</p>
                    {{/if}}

                    {{#if tags}}
                    <div class="mb-6">
                        <h4 class="text-sm font-semibold uppercase tracking-wide mb-2 {{themeClass 'textSecondary'}}">Tags</h4>
                        <div class="flex flex-wrap gap-2">
                            {{#each tags}}
                            <span class="inline-block text-xs px-3 py-1 rounded-full font-medium {{themeClass 'badge'}}">{{this}}</span>
                            {{/each}}
                        </div>
                    </div>
                    {{/if}}

                    {{#if parameters}}
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-4 {{themeClass 'text'}}">Parameters</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full rounded-lg {{themeClass 'surface'}}">
                                <thead>
                                    <tr class="{{themeClass 'surface'}}">
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider {{themeClass 'textSecondary'}}">Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider {{themeClass 'textSecondary'}}">Type</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider {{themeClass 'textSecondary'}}">In</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider {{themeClass 'textSecondary'}}">Required</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider {{themeClass 'textSecondary'}}">Description</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y {{themeClass 'border'}}">
                                    {{#each parameters}}
                                    <tr class="hover:{{themeClass 'surface'}}">
                                        <td class="px-6 py-4 whitespace-nowrap font-mono text-sm {{themeClass 'text'}}">{{name}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <span class="px-2 py-1 rounded text-xs {{themeClass 'badge'}}">{{type}}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm {{themeClass 'textSecondary'}}">{{in}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            {{#if required}}
                                            <span class="text-red-600 font-medium">Required</span>
                                            {{else}}
                                            <span class="{{themeClass 'textSecondary'}}">Optional</span>
                                            {{/if}}
                                        </td>
                                        <td class="px-6 py-4 text-sm {{themeClass 'textSecondary'}}">{{description}}</td>
                                    </tr>
                                    {{/each}}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {{/if}}

                    {{#if responses}}
                    <div>
                        <h4 class="text-lg font-semibold mb-4 {{themeClass 'text'}}">Responses</h4>
                        <div class="space-y-3">
                            {{#each responses}}
                            <div class="flex items-start p-4 rounded-lg {{themeClass 'surface'}}">
                                <span class="inline-block px-3 py-1 text-sm font-mono rounded border mr-4 min-w-[60px] text-center {{themeClass 'card'}} {{themeClass 'text'}} {{themeClass 'border'}}">{{statusCode}}</span>
                                <div class="flex-1">
                                    <span class="font-medium {{themeClass 'text'}}">{{description}}</span>
                                    {{#if schema}}
                                    <pre class="mt-2 text-xs p-2 rounded border overflow-x-auto {{themeClass 'card'}} {{themeClass 'textSecondary'}} {{themeClass 'border'}}"><code>{{json schema}}</code></pre>
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

        <footer class="mt-16 text-center text-sm {{themeClass 'textSecondary'}}">
            <p>Generated with ❤️ by <strong>@kodesonik/zedoc</strong></p>
        </footer>
    </div>
</body>
</html>
    `;
  }
} 