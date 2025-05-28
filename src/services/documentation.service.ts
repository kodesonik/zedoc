import { Injectable } from '@nestjs/common';
import { DocumentationConfig, TemplateData, EndpointInfo } from '../interfaces/documentation.interface';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentationService {
  private config: DocumentationConfig = {};

  constructor() {
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
  }

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
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">{{title}}</h1>
            {{#if description}}
            <p class="text-gray-600 text-lg">{{description}}</p>
            {{/if}}
            {{#if version}}
            <span class="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-2">Version {{version}}</span>
            {{/if}}
        </header>

        <div class="space-y-6">
            {{#each endpoints}}
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center mb-4">
                    <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full 
                        {{#eq method 'GET'}}bg-green-100 text-green-800{{/eq}}
                        {{#eq method 'POST'}}bg-blue-100 text-blue-800{{/eq}}
                        {{#eq method 'PUT'}}bg-yellow-100 text-yellow-800{{/eq}}
                        {{#eq method 'DELETE'}}bg-red-100 text-red-800{{/eq}}
                        {{#eq method 'PATCH'}}bg-purple-100 text-purple-800{{/eq}}">
                        {{method}}
                    </span>
                    <code class="ml-3 text-lg font-mono text-gray-800">{{path}}</code>
                </div>
                
                {{#if summary}}
                <h3 class="text-xl font-semibold text-gray-800 mb-2">{{summary}}</h3>
                {{/if}}
                
                {{#if description}}
                <p class="text-gray-600 mb-4">{{description}}</p>
                {{/if}}

                {{#if tags}}
                <div class="mb-4">
                    {{#each tags}}
                    <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">{{this}}</span>
                    {{/each}}
                </div>
                {{/if}}

                {{#if parameters}}
                <div class="mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Parameters</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-gray-50 rounded">
                            <thead>
                                <tr class="bg-gray-200">
                                    <th class="px-4 py-2 text-left">Name</th>
                                    <th class="px-4 py-2 text-left">Type</th>
                                    <th class="px-4 py-2 text-left">In</th>
                                    <th class="px-4 py-2 text-left">Required</th>
                                    <th class="px-4 py-2 text-left">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{#each parameters}}
                                <tr>
                                    <td class="px-4 py-2 font-mono">{{name}}</td>
                                    <td class="px-4 py-2">{{type}}</td>
                                    <td class="px-4 py-2">{{in}}</td>
                                    <td class="px-4 py-2">{{#if required}}Yes{{else}}No{{/if}}</td>
                                    <td class="px-4 py-2">{{description}}</td>
                                </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    </div>
                </div>
                {{/if}}

                {{#if responses}}
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Responses</h4>
                    <div class="space-y-2">
                        {{#each responses}}
                        <div class="flex items-start">
                            <span class="inline-block px-2 py-1 text-sm font-mono bg-gray-100 text-gray-800 rounded mr-3">{{statusCode}}</span>
                            <span class="text-gray-700">{{description}}</span>
                        </div>
                        {{/each}}
                    </div>
                </div>
                {{/if}}
            </div>
            {{/each}}
        </div>
    </div>
</body>
</html>
    `;
  }
} 