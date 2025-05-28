import { Injectable, Inject, Optional } from '@nestjs/common';
import { SectionConfig, ModuleConfig, EndpointConfig } from '../interfaces/documentation.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SwaggerIntegrationService {
  private swaggerDocument: any = null;

  constructor() {}

  /**
   * Set the Swagger document manually (called from the application)
   */
  setSwaggerDocument(document: any): void {
    this.swaggerDocument = document;
  }

  /**
   * Set Swagger document from URL or file path
   * @param source URL (http/https) or file path to JSON file
   * @param options Optional configuration for fetching
   */
  async setSwaggerJson(source: string, options?: {
    timeout?: number;
    headers?: Record<string, string>;
    encoding?: BufferEncoding;
  }): Promise<void> {
    try {
      console.log(`🔄 Loading Swagger document from: ${source}`);
      
      let swaggerDoc: any;
      
      if (this.isUrl(source)) {
        // Fetch from URL
        swaggerDoc = await this.fetchSwaggerFromUrl(source, options);
      } else {
        // Load from file path
        swaggerDoc = await this.loadSwaggerFromFile(source, options?.encoding);
      }
      
      // Validate the document
      if (!this.isValidSwaggerDocument(swaggerDoc)) {
        throw new Error('Invalid Swagger/OpenAPI document format');
      }
      
      this.swaggerDocument = swaggerDoc;
      console.log(`✅ Swagger document loaded successfully from: ${source}`);
      console.log(`📊 Document info: ${swaggerDoc.info?.title || 'Unknown'} v${swaggerDoc.info?.version || 'Unknown'}`);
      
      if (swaggerDoc.paths) {
        const pathCount = Object.keys(swaggerDoc.paths).length;
        console.log(`🛣️  Found ${pathCount} paths in the document`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to load Swagger document from ${source}:`, error.message);
      throw new Error(`Failed to load Swagger document: ${error.message}`);
    }
  }

  /**
   * Check if a string is a URL
   */
  private isUrl(source: string): boolean {
    try {
      const url = new URL(source);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Fetch Swagger document from URL
   */
  private async fetchSwaggerFromUrl(url: string, options?: {
    timeout?: number;
    headers?: Record<string, string>;
  }): Promise<any> {
    const timeout = options?.timeout || 10000; // 10 seconds default
    const headers = {
      'Accept': 'application/json',
      'User-Agent': '@kodesonik/zedoc',
      ...options?.headers
    };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn(`⚠️  Content-Type is ${contentType}, expected application/json`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Load Swagger document from file path
   */
  private async loadSwaggerFromFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<any> {
    try {
      // Resolve relative paths
      const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
      
      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
      }

      // Check file extension
      const ext = path.extname(resolvedPath).toLowerCase();
      if (ext !== '.json') {
        console.warn(`⚠️  File extension is ${ext}, expected .json`);
      }

      // Read and parse file
      const fileContent = fs.readFileSync(resolvedPath, encoding);
      const data = JSON.parse(fileContent);
      
      return data;

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate if the document is a valid Swagger/OpenAPI document
   */
  private isValidSwaggerDocument(doc: any): boolean {
    if (!doc || typeof doc !== 'object') {
      return false;
    }

    // Check for OpenAPI 3.x
    if (doc.openapi && typeof doc.openapi === 'string') {
      return doc.openapi.startsWith('3.') && doc.info && doc.paths;
    }

    // Check for Swagger 2.x
    if (doc.swagger && typeof doc.swagger === 'string') {
      return doc.swagger.startsWith('2.') && doc.info && doc.paths;
    }

    return false;
  }

  /**
   * Get current Swagger document info
   */
  getSwaggerInfo(): { title?: string; version?: string; description?: string; pathsCount?: number } | null {
    if (!this.swaggerDocument) {
      return null;
    }

    return {
      title: this.swaggerDocument.info?.title,
      version: this.swaggerDocument.info?.version,
      description: this.swaggerDocument.info?.description,
      pathsCount: this.swaggerDocument.paths ? Object.keys(this.swaggerDocument.paths).length : 0
    };
  }

  /**
   * Get Swagger document
   */
  async getSwaggerDocument(): Promise<any> {
    if (this.swaggerDocument) {
      console.log('Found stored Swagger document');
      return this.swaggerDocument;
    }

    console.warn('No Swagger document found');
    return null;
  }

  /**
   * Automatically convert Swagger document to structured sections
   * ApiTags become sections, ApiOperation summaries become modules
   * Enhanced to handle complex real-world APIs with rich schemas and examples
   */
  convertSwaggerToSections(swaggerDoc: any): SectionConfig[] {
    if (!swaggerDoc.paths) {
      return [];
    }

    // Group endpoints by tags (sections)
    const tagGroups: { [tag: string]: any[] } = {};
    
    Object.keys(swaggerDoc.paths).forEach(path => {
      const pathItem = swaggerDoc.paths[path];
      
      Object.keys(pathItem).forEach(method => {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())) {
          const operation = pathItem[method];
          const tags = operation.tags || ['Default'];
          
          tags.forEach(tag => {
            if (!tagGroups[tag]) {
              tagGroups[tag] = [];
            }
            
            tagGroups[tag].push({
              method: method.toUpperCase(),
              path: path,
              summary: operation.summary || `${method.toUpperCase()} ${path}`,
              description: operation.description || '',
              operation: operation,
              operationId: operation.operationId
            });
          });
        }
      });
    });

    // Convert tag groups to sections
    const sections: SectionConfig[] = [];
    
    Object.keys(tagGroups).forEach(tagName => {
      const endpoints = tagGroups[tagName];
      
      // Group endpoints by summary (modules) - but be smarter about grouping
      const moduleGroups: { [summary: string]: any[] } = {};
      
      endpoints.forEach(endpoint => {
        // Use a more intelligent module name based on operation patterns
        const moduleName = this.generateModuleName(endpoint, endpoints);
        if (!moduleGroups[moduleName]) {
          moduleGroups[moduleName] = [];
        }
        moduleGroups[moduleName].push(endpoint);
      });

      // Convert module groups to modules
      const modules: ModuleConfig[] = [];
      
      Object.keys(moduleGroups).forEach(moduleName => {
        const moduleEndpoints = moduleGroups[moduleName];
        
        const endpointConfigs: EndpointConfig[] = moduleEndpoints.map(ep => {
          const endpointConfig: EndpointConfig = {
            method: ep.method,
            path: ep.path,
            summary: ep.summary,
            description: ep.description,
            requiresAuth: this.detectAuthRequirement(ep.operation, swaggerDoc),
            tags: ep.operation.tags || [],
            additionalHeaders: this.extractAdditionalHeaders(ep.operation),
            requestBody: this.extractRequestBody(ep.operation, swaggerDoc),
            successData: this.extractSuccessResponse(ep.operation, swaggerDoc),
            successStatus: this.extractSuccessStatus(ep.operation),
            successMessage: this.extractSuccessMessage(ep.operation, swaggerDoc),
            errorResponses: this.extractErrorResponses(ep.operation, swaggerDoc),
            // Enhanced fields for complex APIs
            parameters: this.extractParameters(ep.operation, swaggerDoc),
            requestExamples: this.extractRequestExamples(ep.operation, swaggerDoc),
            responseExamples: this.extractResponseExamples(ep.operation, swaggerDoc)
          };
          
          return endpointConfig;
        });

        modules.push({
          id: this.sanitizeId(moduleName),
          name: moduleName,
          description: this.generateModuleDescription(moduleName, moduleEndpoints),
          endpoints: endpointConfigs
        });
      });

      sections.push({
        id: this.sanitizeId(tagName),
        name: tagName,
        modules: modules
      });
    });

    return sections;
  }

  /**
   * Generate intelligent module names based on operation patterns
   */
  private generateModuleName(endpoint: any, allEndpoints: any[]): string {
    const { operation, path, method } = endpoint;
    
    // If we have a clear summary, use it
    if (operation.summary && operation.summary.length > 0) {
      return operation.summary;
    }
    
    // Try to extract resource name from path
    const pathParts = path.split('/').filter(part => part && !part.startsWith('{'));
    const resourceName = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'Resource';
    
    // Generate based on method and resource
    const methodActions = {
      'GET': path.includes('{') ? `Get ${resourceName}` : `List ${resourceName}`,
      'POST': `Create ${resourceName}`,
      'PUT': `Update ${resourceName}`,
      'PATCH': `Update ${resourceName}`,
      'DELETE': `Delete ${resourceName}`
    };
    
    return methodActions[method] || `${method} ${resourceName}`;
  }

  /**
   * Generate module description based on endpoints
   */
  private generateModuleDescription(moduleName: string, endpoints: any[]): string {
    if (endpoints.length === 1) {
      return endpoints[0].description || `${moduleName} operations`;
    }
    
    const methods = endpoints.map(ep => ep.method).join(', ');
    return `${moduleName} operations (${methods})`;
  }

  /**
   * Enhanced authentication detection with security schemes
   */
  private detectAuthRequirement(operation: any, swaggerDoc: any): boolean {
    // Check if operation has security requirements
    if (operation.security && operation.security.length > 0) {
      return true;
    }
    
    // Check global security if no operation-level security
    if (!operation.security && swaggerDoc.security && swaggerDoc.security.length > 0) {
      return true;
    }
    
    // Check for common auth-related parameters or headers
    if (operation.parameters) {
      const hasAuthParam = operation.parameters.some((param: any) => 
        param.name && (
          param.name.toLowerCase().includes('auth') ||
          param.name.toLowerCase().includes('token') ||
          param.name.toLowerCase().includes('key') ||
          param.name.toLowerCase() === 'authorization'
        )
      );
      if (hasAuthParam) return true;
    }
    
    return false;
  }

  /**
   * Extract additional headers from operation
   */
  private extractAdditionalHeaders(operation: any): Record<string, string> | undefined {
    const headers: Record<string, string> = {};
    
    if (operation.parameters) {
      operation.parameters.forEach((param: any) => {
        if (param.in === 'header' && param.name.toLowerCase() !== 'authorization') {
          headers[param.name] = param.example || param.schema?.example || 'header_value';
        }
      });
    }
    
    return Object.keys(headers).length > 0 ? headers : undefined;
  }

  /**
   * Enhanced request body extraction with schema resolution
   */
  private extractRequestBody(operation: any, swaggerDoc: any): any {
    if (!operation.requestBody) return undefined;
    
    try {
      const content = operation.requestBody.content;
      if (content && content['application/json']) {
        const schema = content['application/json'].schema;
        
        if (schema) {
          // If it's a reference, resolve it
          if (schema.$ref) {
            const resolvedSchema = this.resolveSchemaReference(schema.$ref, swaggerDoc);
            return this.generateExampleFromSchema(resolvedSchema, swaggerDoc);
          }
          
          // If it has a direct example
          if (schema.example) {
            return schema.example;
          }
          
          // Generate from schema
          return this.generateExampleFromSchema(schema, swaggerDoc);
        }
      }
    } catch (error) {
      console.warn('Error extracting request body:', error);
    }
    
    return undefined;
  }

  /**
   * Enhanced success response extraction with schema resolution
   */
  private extractSuccessResponse(operation: any, swaggerDoc: any): any {
    if (!operation.responses) return undefined;
    
    try {
      // Look for success responses in order of preference
      const successCodes = ['200', '201', '202', '204'];
      let successResponse = null;
      let successCode = null;
      
      for (const code of successCodes) {
        if (operation.responses[code]) {
          successResponse = operation.responses[code];
          successCode = code;
          break;
        }
      }
      
      if (!successResponse) {
        // Find first 2xx response
        successCode = Object.keys(operation.responses).find(code => 
          code.startsWith('2') && code.length === 3
        );
        if (successCode) {
          successResponse = operation.responses[successCode];
        }
      }
      
      if (successResponse && successResponse.content) {
        const content = successResponse.content['application/json'];
        if (content && content.schema) {
          // Resolve schema references
          if (content.schema.$ref) {
            const resolvedSchema = this.resolveSchemaReference(content.schema.$ref, swaggerDoc);
            return this.generateExampleFromSchema(resolvedSchema, swaggerDoc);
          }
          
          if (content.schema.example) {
            return content.schema.example;
          }
          
          return this.generateExampleFromSchema(content.schema, swaggerDoc);
        }
      }
    } catch (error) {
      console.warn('Error extracting success response:', error);
    }
    
    return undefined;
  }

  /**
   * Extract success message from response description
   */
  private extractSuccessMessage(operation: any, swaggerDoc: any): string | undefined {
    if (!operation.responses) return undefined;
    
    const successCodes = ['200', '201', '202', '204'];
    for (const code of successCodes) {
      if (operation.responses[code] && operation.responses[code].description) {
        return operation.responses[code].description;
      }
    }
    
    return undefined;
  }

  /**
   * Extract success status code from operation
   */
  private extractSuccessStatus(operation: any): number {
    if (!operation.responses) return 200;
    
    const successCodes = ['200', '201', '202', '204'];
    for (const code of successCodes) {
      if (operation.responses[code]) {
        return parseInt(code);
      }
    }
    
    // Find first 2xx response
    const responseCode = Object.keys(operation.responses).find(code => 
      code.startsWith('2') && code.length === 3
    );
    
    return responseCode ? parseInt(responseCode) : 200;
  }

  /**
   * Enhanced error response extraction with detailed error information
   */
  private extractErrorResponses(operation: any, swaggerDoc: any): Array<{status: number, description: string, error: string, message: string}> {
    if (!operation.responses) return [];
    
    const errorResponses: Array<{status: number, description: string, error: string, message: string}> = [];
    
    Object.keys(operation.responses).forEach(statusCode => {
      const code = parseInt(statusCode);
      if (code >= 400) {
        const response = operation.responses[statusCode];
        let errorExample = null;
        let errorMessage = response.description || `Error ${code}`;
        
        // Try to extract error example from schema
        if (response.content && response.content['application/json']) {
          const schema = response.content['application/json'].schema;
          if (schema) {
            if (schema.$ref) {
              const resolvedSchema = this.resolveSchemaReference(schema.$ref, swaggerDoc);
              errorExample = this.generateExampleFromSchema(resolvedSchema, swaggerDoc);
            } else if (schema.example) {
              errorExample = schema.example;
            } else {
              errorExample = this.generateExampleFromSchema(schema, swaggerDoc);
            }
            
            // Extract message from example if available
            if (errorExample && errorExample.message) {
              errorMessage = errorExample.message;
            }
          }
        }
        
        errorResponses.push({
          status: code,
          description: response.description || `Error ${code}`,
          error: errorExample?.error || `ERROR_${code}`,
          message: errorMessage
        });
      }
    });
    
    return errorResponses;
  }

  /**
   * Extract parameters (query, path, header)
   */
  private extractParameters(operation: any, swaggerDoc: any): any[] {
    if (!operation.parameters) return [];
    
    return operation.parameters.map((param: any) => ({
      name: param.name,
      in: param.in,
      required: param.required || false,
      description: param.description || '',
      type: param.schema?.type || 'string',
      example: param.example || param.schema?.example || this.generateExampleForType(param.schema?.type)
    }));
  }

  /**
   * Extract request examples from multiple sources
   */
  private extractRequestExamples(operation: any, swaggerDoc: any): any[] {
    const examples: any[] = [];
    
    if (operation.requestBody && operation.requestBody.content) {
      const content = operation.requestBody.content['application/json'];
      if (content) {
        // Check for examples object
        if (content.examples) {
          Object.keys(content.examples).forEach(key => {
            examples.push({
              name: key,
              summary: content.examples[key].summary || key,
              value: content.examples[key].value
            });
          });
        }
        
        // Check for single example
        if (content.example) {
          examples.push({
            name: 'default',
            summary: 'Default example',
            value: content.example
          });
        }
        
        // Generate from schema if no examples
        if (examples.length === 0 && content.schema) {
          const generated = this.extractRequestBody(operation, swaggerDoc);
          if (generated) {
            examples.push({
              name: 'generated',
              summary: 'Generated example',
              value: generated
            });
          }
        }
      }
    }
    
    return examples;
  }

  /**
   * Extract response examples from multiple sources
   */
  private extractResponseExamples(operation: any, swaggerDoc: any): any[] {
    const examples: any[] = [];
    
    if (operation.responses) {
      Object.keys(operation.responses).forEach(statusCode => {
        const response = operation.responses[statusCode];
        if (response.content && response.content['application/json']) {
          const content = response.content['application/json'];
          
          // Check for examples object
          if (content.examples) {
            Object.keys(content.examples).forEach(key => {
              examples.push({
                name: `${statusCode}_${key}`,
                summary: `${statusCode} - ${content.examples[key].summary || key}`,
                status: parseInt(statusCode),
                value: content.examples[key].value
              });
            });
          }
          
          // Check for single example
          if (content.example) {
            examples.push({
              name: `${statusCode}_default`,
              summary: `${statusCode} - Default example`,
              status: parseInt(statusCode),
              value: content.example
            });
          }
        }
      });
    }
    
    return examples;
  }

  /**
   * Resolve schema reference ($ref) to actual schema
   */
  private resolveSchemaReference(ref: string, swaggerDoc: any): any {
    if (!ref.startsWith('#/')) {
      return null;
    }
    
    const path = ref.substring(2).split('/');
    let current = swaggerDoc;
    
    for (const segment of path) {
      if (current && current[segment]) {
        current = current[segment];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Enhanced example generation from schema with reference resolution
   */
  private generateExampleFromSchema(schema: any, swaggerDoc: any, visited: Set<string> = new Set()): any {
    if (!schema) return undefined;
    
    // Handle circular references
    const schemaKey = JSON.stringify(schema);
    if (visited.has(schemaKey)) {
      return '[Circular Reference]';
    }
    visited.add(schemaKey);
    
    // Handle schema references
    if (schema.$ref) {
      const resolvedSchema = this.resolveSchemaReference(schema.$ref, swaggerDoc);
      if (resolvedSchema) {
        return this.generateExampleFromSchema(resolvedSchema, swaggerDoc, visited);
      }
    }
    
    // Use existing example if available
    if (schema.example !== undefined) {
      return schema.example;
    }
    
    // Handle different schema types
    if (schema.type === 'object' && schema.properties) {
      const example: any = {};
      Object.keys(schema.properties).forEach(prop => {
        const propSchema = schema.properties[prop];
        example[prop] = this.generateExampleFromSchema(propSchema, swaggerDoc, visited);
      });
      return example;
    }
    
    if (schema.type === 'array' && schema.items) {
      const itemExample = this.generateExampleFromSchema(schema.items, swaggerDoc, visited);
      return [itemExample];
    }
    
    if (schema.allOf) {
      // Merge all schemas in allOf
      const merged: any = {};
      schema.allOf.forEach((subSchema: any) => {
        const subExample = this.generateExampleFromSchema(subSchema, swaggerDoc, visited);
        if (typeof subExample === 'object' && subExample !== null) {
          Object.assign(merged, subExample);
        }
      });
      return merged;
    }
    
    if (schema.oneOf || schema.anyOf) {
      // Use the first schema in oneOf/anyOf
      const schemas = schema.oneOf || schema.anyOf;
      if (schemas.length > 0) {
        return this.generateExampleFromSchema(schemas[0], swaggerDoc, visited);
      }
    }
    
    // Generate based on type
    return this.generateExampleForType(schema.type, schema.format, schema.enum);
  }

  /**
   * Generate example for primitive types
   */
  private generateExampleForType(type: string, format?: string, enumValues?: string[]): any {
    if (enumValues && enumValues.length > 0) {
      return enumValues[0];
    }
    
    switch (type) {
      case 'string':
        if (format === 'email') return 'user@example.com';
        if (format === 'date-time') return '2024-01-01T00:00:00Z';
        if (format === 'date') return '2024-01-01';
        if (format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
        if (format === 'uri') return 'https://example.com';
        return 'string';
      case 'number':
      case 'integer':
        return 123;
      case 'boolean':
        return true;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * Sanitize string to be used as ID
   */
  private sanitizeId(str: string): string {
    return str.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Create a sample Swagger document for demonstration
   */
  createSampleSwaggerDocument(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Sample API',
        description: 'A sample API to demonstrate @kodesonik/zedoc',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      paths: {
        '/': {
          get: {
            tags: ['App'],
            summary: 'Get hello message',
            description: 'Returns a simple hello world message',
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'text/plain': {
                    schema: {
                      type: 'string',
                      example: 'Hello World!',
                    },
                  },
                },
              },
            },
          },
        },
        '/health': {
          get: {
            tags: ['App'],
            summary: 'Health check',
            description: 'Check if the application is running',
            responses: {
              '200': {
                description: 'Application is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number', example: 123.456 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get all users',
            description: 'Retrieve a paginated list of all users in the system',
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: 'Page number for pagination',
                required: false,
                schema: {
                  type: 'integer',
                  minimum: 1,
                  default: 1,
                },
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Number of items per page',
                required: false,
                schema: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                },
              },
            ],
            responses: {
              '200': {
                description: 'Successfully retrieved users',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/User',
                          },
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination',
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Bad request - Invalid parameters',
              },
            },
          },
          post: {
            tags: ['Users'],
            summary: 'Create a new user',
            description: 'Create a new user in the system',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateUserDto',
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'User created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid user data provided',
              },
            },
          },
        },
        '/users/{id}': {
          get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            description: 'Retrieve a specific user by their unique identifier',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'User ID',
                required: true,
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'User found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
              '404': {
                description: 'User not found',
              },
            },
          },
        },
        '/users/search/by-name': {
          get: {
            tags: ['Users'],
            summary: 'Search users by name',
            description: 'Search for users by their name (case-insensitive)',
            parameters: [
              {
                name: 'name',
                in: 'query',
                description: 'Name to search for',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: 'Search results',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                        results: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/User',
                          },
                        },
                        count: { type: 'integer' },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Name parameter is required',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              age: { type: 'integer', example: 30 },
            },
            required: ['id', 'name', 'email'],
          },
          CreateUserDto: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', format: 'email', example: 'john@example.com' },
              age: { type: 'integer', example: 30 },
            },
            required: ['name', 'email'],
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 100 },
              totalPages: { type: 'integer', example: 10 },
            },
          },
        },
      },
    };
  }
} 