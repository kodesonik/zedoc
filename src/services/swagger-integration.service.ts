import { Injectable, Inject, Optional } from '@nestjs/common';
import { SectionConfig, ModuleConfig, EndpointConfig } from '../interfaces/documentation.interface';

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
              operation: operation
            });
          });
        }
      });
    });

    // Convert tag groups to sections
    const sections: SectionConfig[] = [];
    
    Object.keys(tagGroups).forEach(tagName => {
      const endpoints = tagGroups[tagName];
      
      // Group endpoints by summary (modules)
      const moduleGroups: { [summary: string]: any[] } = {};
      
      endpoints.forEach(endpoint => {
        const moduleName = endpoint.summary || 'Default Module';
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
            requiresAuth: this.detectAuthRequirement(ep.operation),
            tags: ep.operation.tags || [],
            requestBody: this.extractRequestBody(ep.operation),
            successData: this.extractSuccessResponse(ep.operation),
            successStatus: this.extractSuccessStatus(ep.operation),
            errorResponses: this.extractErrorResponses(ep.operation)
          };
          
          return endpointConfig;
        });

        modules.push({
          id: this.sanitizeId(moduleName),
          name: moduleName,
          description: `${moduleName} operations`,
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
   * Detect if an endpoint requires authentication based on security schemes
   */
  private detectAuthRequirement(operation: any): boolean {
    // Check if operation has security requirements
    if (operation.security && operation.security.length > 0) {
      return true;
    }
    
    // Check for common auth-related parameters or headers
    if (operation.parameters) {
      const hasAuthParam = operation.parameters.some((param: any) => 
        param.name && (
          param.name.toLowerCase().includes('auth') ||
          param.name.toLowerCase().includes('token') ||
          param.name.toLowerCase().includes('key')
        )
      );
      if (hasAuthParam) return true;
    }
    
    return false;
  }

  /**
   * Extract request body example from operation
   */
  private extractRequestBody(operation: any): any {
    if (!operation.requestBody) return undefined;
    
    try {
      const content = operation.requestBody.content;
      if (content && content['application/json']) {
        const schema = content['application/json'].schema;
        if (schema && schema.example) {
          return schema.example;
        }
        
        // Generate example from schema properties
        if (schema && schema.properties) {
          const example: any = {};
          Object.keys(schema.properties).forEach(prop => {
            const propSchema = schema.properties[prop];
            if (propSchema.example !== undefined) {
              example[prop] = propSchema.example;
            } else if (propSchema.type === 'string') {
              example[prop] = propSchema.format === 'email' ? 'user@example.com' : 'string';
            } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
              example[prop] = 123;
            } else if (propSchema.type === 'boolean') {
              example[prop] = true;
            }
          });
          return Object.keys(example).length > 0 ? example : undefined;
        }
      }
    } catch (error) {
      console.warn('Error extracting request body:', error);
    }
    
    return undefined;
  }

  /**
   * Extract success response example from operation
   */
  private extractSuccessResponse(operation: any): any {
    if (!operation.responses) return undefined;
    
    try {
      // Look for 200, 201, or first 2xx response
      const successCodes = ['200', '201', '202', '204'];
      let successResponse = null;
      
      for (const code of successCodes) {
        if (operation.responses[code]) {
          successResponse = operation.responses[code];
          break;
        }
      }
      
      if (!successResponse) {
        // Find first 2xx response
        const responseCode = Object.keys(operation.responses).find(code => 
          code.startsWith('2') && code.length === 3
        );
        if (responseCode) {
          successResponse = operation.responses[responseCode];
        }
      }
      
      if (successResponse && successResponse.content) {
        const content = successResponse.content['application/json'];
        if (content && content.schema) {
          if (content.schema.example) {
            return content.schema.example;
          }
          
          // Generate example from schema
          return this.generateExampleFromSchema(content.schema);
        }
      }
    } catch (error) {
      console.warn('Error extracting success response:', error);
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
   * Extract error responses from operation
   */
  private extractErrorResponses(operation: any): Array<{status: number, description: string, error: string, message: string}> {
    if (!operation.responses) return [];
    
    const errorResponses: Array<{status: number, description: string, error: string, message: string}> = [];
    
    Object.keys(operation.responses).forEach(statusCode => {
      const code = parseInt(statusCode);
      if (code >= 400) {
        const response = operation.responses[statusCode];
        errorResponses.push({
          status: code,
          description: response.description || `Error ${code}`,
          error: `ERROR_${code}`,
          message: response.description || `An error occurred with status ${code}`
        });
      }
    });
    
    return errorResponses;
  }

  /**
   * Generate example data from JSON schema
   */
  private generateExampleFromSchema(schema: any): any {
    if (!schema) return undefined;
    
    if (schema.example !== undefined) {
      return schema.example;
    }
    
    if (schema.type === 'object' && schema.properties) {
      const example: any = {};
      Object.keys(schema.properties).forEach(prop => {
        const propSchema = schema.properties[prop];
        example[prop] = this.generateExampleFromSchema(propSchema);
      });
      return example;
    }
    
    if (schema.type === 'array' && schema.items) {
      return [this.generateExampleFromSchema(schema.items)];
    }
    
    switch (schema.type) {
      case 'string':
        return schema.format === 'email' ? 'user@example.com' : 
               schema.format === 'date-time' ? '2024-01-01T00:00:00Z' :
               'string';
      case 'number':
      case 'integer':
        return 123;
      case 'boolean':
        return true;
      default:
        return undefined;
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