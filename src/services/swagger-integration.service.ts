import { Injectable, Inject, Optional } from '@nestjs/common';

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