import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Unified API Documentation - Structured Mode',
      description: 'Demonstrating the unified Zedoc module with structured mode (manual configuration)',
      version: '3.0.0',
      theme: {
        preset: 'insomnia',
        mode: 'light',
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        fonts: {
          size: 'md',
          family: 'inter'
        }
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        collapsible: true,
        width: '380px',
        try: {
          enabled: true,
          position: 'auto',
          width: '480px',
          defaultExpanded: false,
        }
      },
      environment: {
        variables: [
          {
            name: 'accessToken',
            value: '',
            description: 'JWT access token for API authentication',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'refreshToken',
            value: '',
            description: 'JWT refresh token for token renewal',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'apiKey',
            value: '',
            description: 'API key for service authentication',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'baseUrl',
            value: 'https://api.example.com',
            description: 'Base URL for API requests',
            type: 'custom',
            sensitive: false,
          },
          {
            name: 'userId',
            value: '123',
            description: 'Default user ID for testing',
            type: 'query',
            sensitive: false,
          },
        ],
        defaultTokens: {
          accessToken: '',
          refreshToken: '',
          apiKey: '',
          bearerToken: '',
        },
        headers: {
          'X-Client-Version': '3.0.0',
          'X-Platform': 'web',
          'Accept': 'application/json',
        },
        queryParams: {
          'version': 'v1',
          'format': 'json',
        },
      },
      branding: {
        favicon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        logo: {
          src: 'https://nestjs.com/img/logo-small.svg',
          alt: 'Unified API Logo',
          height: '50px',
          position: 'both',
          link: 'https://nestjs.com'
        },
        cover: {
          src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80',
          alt: 'Unified API Documentation',
          position: 'hero',
          height: '350px',
          overlay: true,
          overlayColor: 'rgba(99, 102, 241, 0.8)'
        }
      },
      // Structured mode configuration - presence of sections triggers structured mode
      sections: [
        {
          id: 'authentication',
          name: 'Authentication',
          modules: [
            {
              id: 'auth',
              name: 'Authentication Module',
              description: 'Handle user authentication and authorization',
              endpoints: [
                {
                  method: 'POST',
                  path: '/auth/login',
                  summary: 'User Login',
                  description: 'Authenticate user with email and password',
                  requiresAuth: false,
                  tags: ['auth', 'login'],
                  requestBody: {
                    email: 'user@example.com',
                    password: 'password123'
                  },
                  successData: {
                    accessToken: 'jwt_token_here',
                    refreshToken: 'refresh_token_here',
                    user: {
                      id: 1,
                      email: 'user@example.com',
                      name: 'John Doe'
                    }
                  },
                  successMessage: 'Login successful',
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 401,
                      description: 'Invalid credentials',
                      error: 'INVALID_CREDENTIALS',
                      message: 'Email or password is incorrect'
                    },
                    {
                      status: 400,
                      description: 'Validation error',
                      error: 'VALIDATION_ERROR',
                      message: 'Email and password are required'
                    }
                  ]
                },
                {
                  method: 'POST',
                  path: '/auth/refresh',
                  summary: 'Refresh Token',
                  description: 'Get new access token using refresh token',
                  requiresAuth: true,
                  tags: ['auth', 'token'],
                  requestBody: {
                    refreshToken: 'refresh_token_here'
                  },
                  successData: {
                    accessToken: 'new_jwt_token_here',
                    expiresIn: 3600
                  },
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 401,
                      description: 'Invalid refresh token',
                      error: 'INVALID_REFRESH_TOKEN',
                      message: 'Refresh token is invalid or expired'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'users',
          name: 'User Management',
          modules: [
            {
              id: 'users',
              name: 'Users Module',
              description: 'Manage user accounts and profiles',
              endpoints: [
                {
                  method: 'GET',
                  path: '/users',
                  summary: 'Get All Users',
                  description: 'Retrieve a paginated list of all users',
                  requiresAuth: true,
                  tags: ['users', 'list'],
                  additionalHeaders: {
                    'X-Page-Size': '20'
                  },
                  successData: {
                    users: [
                      {
                        id: 1,
                        email: 'user1@example.com',
                        name: 'John Doe',
                        createdAt: '2024-01-01T00:00:00Z'
                      },
                      {
                        id: 2,
                        email: 'user2@example.com',
                        name: 'Jane Smith',
                        createdAt: '2024-01-02T00:00:00Z'
                      }
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 100,
                      totalPages: 5
                    }
                  },
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 401,
                      description: 'Unauthorized',
                      error: 'UNAUTHORIZED',
                      message: 'Authentication required'
                    }
                  ]
                },
                {
                  method: 'POST',
                  path: '/users',
                  summary: 'Create New User',
                  description: 'Create a new user account',
                  requiresAuth: true,
                  tags: ['users', 'create'],
                  requestBody: {
                    email: 'newuser@example.com',
                    name: 'New User',
                    password: 'securepassword123',
                    profile: {
                      bio: 'New user bio',
                      location: 'San Francisco, CA'
                    }
                  },
                  successData: {
                    id: 3,
                    email: 'newuser@example.com',
                    name: 'New User',
                    createdAt: '2024-01-20T00:00:00Z'
                  },
                  successMessage: 'User created successfully',
                  successStatus: 201,
                  errorResponses: [
                    {
                      status: 400,
                      description: 'Validation error',
                      error: 'VALIDATION_ERROR',
                      message: 'Email is already in use'
                    },
                    {
                      status: 401,
                      description: 'Unauthorized',
                      error: 'UNAUTHORIZED',
                      message: 'Admin privileges required'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class StructuredAppModule {} 