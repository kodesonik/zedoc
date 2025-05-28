import { Injectable, Inject } from '@nestjs/common';
import { DocumentationConfig, TemplateData, EndpointInfo, ParameterInfo, ResponseInfo } from '../interfaces/documentation.interface';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentationService {
  private config: DocumentationConfig = {};

  constructor(@Inject('DOCUMENTATION_CONFIG') config: DocumentationConfig) {
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
console.log(endpoints);
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
        .method-get { @apply bg-green-100 text-green-800; }
        .method-post { @apply bg-blue-100 text-blue-800; }
        .method-put { @apply bg-yellow-100 text-yellow-800; }
        .method-delete { @apply bg-red-100 text-red-800; }
        .method-patch { @apply bg-purple-100 text-purple-800; }
        .method-options { @apply bg-gray-100 text-gray-800; }
        .method-head { @apply bg-indigo-100 text-indigo-800; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <header class="mb-12 text-center">
            <h1 class="text-5xl font-bold text-gray-900 mb-4">{{title}}</h1>
            {{#if description}}
            <p class="text-xl text-gray-600 mb-4">{{description}}</p>
            {{/if}}
            {{#if version}}
            <span class="inline-block bg-blue-500 text-white text-sm px-4 py-2 rounded-full font-medium">Version {{version}}</span>
            {{/if}}
        </header>

        <div class="space-y-8">
            {{#each endpoints}}
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div class="p-6">
                    <div class="flex items-center mb-6">
                        <span class="inline-block px-4 py-2 text-sm font-bold rounded-lg method-{{lowercase method}}">
                            {{method}}
                        </span>
                        <code class="ml-4 text-lg font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded">{{path}}</code>
                    </div>
                    
                    {{#if summary}}
                    <h3 class="text-2xl font-semibold text-gray-900 mb-3">{{summary}}</h3>
                    {{/if}}
                    
                    {{#if description}}
                    <p class="text-gray-700 mb-6 leading-relaxed">{{description}}</p>
                    {{/if}}

                    {{#if tags}}
                    <div class="mb-6">
                        <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h4>
                        <div class="flex flex-wrap gap-2">
                            {{#each tags}}
                            <span class="inline-block bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">{{this}}</span>
                            {{/each}}
                        </div>
                    </div>
                    {{/if}}

                    {{#if parameters}}
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Parameters</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-gray-50 rounded-lg">
                                <thead>
                                    <tr class="bg-gray-200">
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    {{#each parameters}}
                                    <tr class="hover:bg-gray-100">
                                        <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{{name}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <span class="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">{{type}}</span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{in}}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            {{#if required}}
                                            <span class="text-red-600 font-medium">Required</span>
                                            {{else}}
                                            <span class="text-gray-500">Optional</span>
                                            {{/if}}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-700">{{description}}</td>
                                    </tr>
                                    {{/each}}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {{/if}}

                    {{#if responses}}
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Responses</h4>
                        <div class="space-y-3">
                            {{#each responses}}
                            <div class="flex items-start p-4 bg-gray-50 rounded-lg">
                                <span class="inline-block px-3 py-1 text-sm font-mono bg-white text-gray-800 rounded border mr-4 min-w-[60px] text-center">{{statusCode}}</span>
                                <div class="flex-1">
                                    <span class="text-gray-900 font-medium">{{description}}</span>
                                    {{#if schema}}
                                    <pre class="mt-2 text-xs text-gray-600 bg-white p-2 rounded border overflow-x-auto"><code>{{json schema}}</code></pre>
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

        <footer class="mt-16 text-center text-gray-500 text-sm">
            <p>Generated with ❤️ by <strong>@kodesonik/zedoc</strong></p>
        </footer>
    </div>
</body>
</html>
    `;
  }
} 