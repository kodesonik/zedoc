# 🏗️ Zedoc Structured Architecture Guide

The `@kodesonik/zedoc` library now supports a new structured architecture that organizes API documentation into **Sections**, **Modules**, and **Endpoints** with comprehensive environment variables support.

## 📋 Architecture Overview

The structured architecture provides a hierarchical organization:

```
Documentation
├── Section 1 (e.g., Authentication)
│   ├── Module 1 (e.g., Auth Module)
│   │   ├── Endpoint 1 (e.g., POST /auth/login)
│   │   ├── Endpoint 2 (e.g., POST /auth/refresh)
│   │   └── Endpoint 3 (e.g., POST /auth/logout)
│   └── Module 2 (e.g., OAuth Module)
│       ├── Endpoint 1 (e.g., GET /auth/oauth/google)
│       └── Endpoint 2 (e.g., POST /auth/oauth/callback)
├── Section 2 (e.g., User Management)
│   ├── Module 1 (e.g., Users Module)
│   └── Module 2 (e.g., Profiles Module)
└── Section 3 (e.g., Product Management)
    └── Module 1 (e.g., Products Module)
```

## 🔧 Core Interfaces

### DocumentationConfig

```typescript
interface NewDocumentationConfig {
  title: string;
  description: string;
  sections: SectionConfig[];
  environment?: EnvironmentConfig;
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  branding?: BrandingConfig;
  version?: string;
  basePath?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
}
```

### SectionConfig

```typescript
interface SectionConfig {
  id: string;
  name: string;
  modules: ModuleConfig[];
}
```

### ModuleConfig

```typescript
interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  endpoints: EndpointConfig[];
}
```

### EndpointConfig

```typescript
interface EndpointConfig {
  method: string;
  path: string;
  summary: string;
  description: string;
  requiresAuth?: boolean;
  tags?: string | string[];
  additionalHeaders?: Record<string, string>;
  requestBody?: Record<string, any>;
  successData?: any;
  successMessage?: string;
  successStatus?: number;
  errorResponses?: Array<{
    status: number;
    description: string;
    error: string;
    message: string;
  }>;
}
```

### ApiEndpoint (Alternative Format)

```typescript
interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  tags: string | string[];
  requestHeaders?: Record<string, any> | string;
  requestBody?: Record<string, any> | string;
  successResponse?: Record<string, any> | string;
  responseExample?: string;
  errorResponses?: ErrorResponse[];
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  status: number;
  description: string;
  example: Record<string, any> | string;
}
```

## 🚀 Quick Start

### 1. Import the Structured Module

```typescript
import { Module } from '@nestjs/common';
import { StructuredZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    StructuredZedocModule.forRoot({
      title: 'My Structured API',
      description: 'API documentation with structured architecture',
      version: '1.0.0',
      sections: [
        // Your sections configuration
      ]
    }),
  ],
})
export class AppModule {}
```

### 2. Define Your Documentation Structure

```typescript
StructuredZedocModule.forRoot({
  title: 'E-commerce API',
  description: 'Complete e-commerce platform API',
  version: '2.0.0',
  sections: [
    {
      id: 'auth',
      name: 'Authentication',
      modules: [
        {
          id: 'user-auth',
          name: 'User Authentication',
          description: 'Handle user login, registration, and token management',
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
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})
```

### 3. Access Your Documentation

- **Structured Documentation**: `http://localhost:3000/structured-docs`
- **Configuration API**: `http://localhost:3000/structured-docs/config`

## 🌍 Environment Variables Integration

The structured architecture fully supports environment variables for authentication and configuration:

```typescript
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
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web',
    'Accept': 'application/json',
  },
  queryParams: {
    'version': 'v1',
    'format': 'json',
  },
}
```

### Environment Variable Types

1. **Token Variables** (`type: 'token'`)
   - Automatically map to Authorization headers
   - Support for JWT, API keys, bearer tokens
   - Secure password input fields

2. **Header Variables** (`type: 'header'`)
   - Custom HTTP headers
   - Client identification and versioning

3. **Query Variables** (`type: 'query'`)
   - Default query parameters
   - Pagination and filter settings

4. **Body Variables** (`type: 'body'`)
   - Request body templates
   - Default payloads for testing

5. **Custom Variables** (`type: 'custom'`)
   - Configuration values and URLs
   - Custom application settings

## 🎨 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { StructuredZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    StructuredZedocModule.forRoot({
      title: 'E-commerce Platform API',
      description: 'Comprehensive API for e-commerce operations',
      version: '2.0.0',
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
            name: 'apiKey',
            value: '',
            description: 'API key for service authentication',
            type: 'token',
            sensitive: true,
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
          apiKey: '',
        },
        headers: {
          'X-Client-Version': '2.0.0',
          'Accept': 'application/json',
        }
      },
      branding: {
        favicon: '/favicon.svg',
        logo: {
          src: '/logo.svg',
          alt: 'E-commerce API',
          height: '50px',
          position: 'both',
          link: '/'
        },
        cover: {
          src: '/api-hero.jpg',
          alt: 'E-commerce API Documentation',
          position: 'hero',
          height: '350px',
          overlay: true,
          overlayColor: 'rgba(99, 102, 241, 0.8)'
        }
      },
      sections: [
        {
          id: 'authentication',
          name: 'Authentication & Authorization',
          modules: [
            {
              id: 'auth',
              name: 'User Authentication',
              description: 'Handle user authentication and session management',
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
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'refresh_token_here',
                    user: {
                      id: 1,
                      email: 'user@example.com',
                      name: 'John Doe',
                      role: 'customer'
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
                    },
                    {
                      status: 429,
                      description: 'Too many attempts',
                      error: 'RATE_LIMIT_EXCEEDED',
                      message: 'Too many login attempts. Please try again later'
                    }
                  ]
                },
                {
                  method: 'POST',
                  path: '/auth/register',
                  summary: 'User Registration',
                  description: 'Create a new user account',
                  requiresAuth: false,
                  tags: ['auth', 'register'],
                  requestBody: {
                    email: 'newuser@example.com',
                    password: 'securepassword123',
                    name: 'New User',
                    confirmPassword: 'securepassword123'
                  },
                  successData: {
                    user: {
                      id: 2,
                      email: 'newuser@example.com',
                      name: 'New User',
                      role: 'customer',
                      emailVerified: false
                    },
                    message: 'Registration successful. Please check your email for verification.'
                  },
                  successStatus: 201,
                  errorResponses: [
                    {
                      status: 400,
                      description: 'Email already exists',
                      error: 'EMAIL_EXISTS',
                      message: 'An account with this email already exists'
                    },
                    {
                      status: 400,
                      description: 'Password validation failed',
                      error: 'WEAK_PASSWORD',
                      message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
                    }
                  ]
                },
                {
                  method: 'POST',
                  path: '/auth/refresh',
                  summary: 'Refresh Access Token',
                  description: 'Get a new access token using refresh token',
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
            },
            {
              id: 'oauth',
              name: 'OAuth Integration',
              description: 'Third-party authentication providers',
              endpoints: [
                {
                  method: 'GET',
                  path: '/auth/oauth/google',
                  summary: 'Google OAuth Login',
                  description: 'Initiate Google OAuth authentication flow',
                  requiresAuth: false,
                  tags: ['auth', 'oauth', 'google'],
                  successData: {
                    redirectUrl: 'https://accounts.google.com/oauth/authorize?...'
                  },
                  successStatus: 200
                },
                {
                  method: 'POST',
                  path: '/auth/oauth/callback',
                  summary: 'OAuth Callback',
                  description: 'Handle OAuth provider callback',
                  requiresAuth: false,
                  tags: ['auth', 'oauth', 'callback'],
                  requestBody: {
                    code: 'authorization_code_from_provider',
                    state: 'csrf_protection_state'
                  },
                  successData: {
                    accessToken: 'jwt_token_here',
                    refreshToken: 'refresh_token_here',
                    user: {
                      id: 3,
                      email: 'oauth.user@gmail.com',
                      name: 'OAuth User',
                      provider: 'google'
                    }
                  },
                  successStatus: 200
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
              name: 'User Operations',
              description: 'Manage user accounts and information',
              endpoints: [
                {
                  method: 'GET',
                  path: '/users',
                  summary: 'Get All Users',
                  description: 'Retrieve a paginated list of users with filtering options',
                  requiresAuth: true,
                  tags: ['users', 'list', 'admin'],
                  additionalHeaders: {
                    'X-Page-Size': '20',
                    'X-Sort-By': 'createdAt',
                    'X-Sort-Order': 'desc'
                  },
                  successData: {
                    users: [
                      {
                        id: 1,
                        email: 'user1@example.com',
                        name: 'John Doe',
                        role: 'customer',
                        emailVerified: true,
                        createdAt: '2024-01-01T00:00:00Z',
                        lastLoginAt: '2024-01-15T10:30:00Z'
                      },
                      {
                        id: 2,
                        email: 'user2@example.com',
                        name: 'Jane Smith',
                        role: 'admin',
                        emailVerified: true,
                        createdAt: '2024-01-02T00:00:00Z',
                        lastLoginAt: '2024-01-16T09:15:00Z'
                      }
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 150,
                      totalPages: 8,
                      hasNext: true,
                      hasPrev: false
                    },
                    filters: {
                      role: null,
                      emailVerified: null,
                      search: null
                    }
                  },
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 401,
                      description: 'Unauthorized',
                      error: 'UNAUTHORIZED',
                      message: 'Authentication required'
                    },
                    {
                      status: 403,
                      description: 'Forbidden',
                      error: 'INSUFFICIENT_PERMISSIONS',
                      message: 'Admin privileges required to view all users'
                    }
                  ]
                },
                {
                  method: 'GET',
                  path: '/users/:id',
                  summary: 'Get User by ID',
                  description: 'Retrieve detailed information about a specific user',
                  requiresAuth: true,
                  tags: ['users', 'detail'],
                  successData: {
                    id: 1,
                    email: 'user@example.com',
                    name: 'John Doe',
                    role: 'customer',
                    emailVerified: true,
                    profile: {
                      avatar: 'https://example.com/avatars/user1.jpg',
                      bio: 'Software developer and tech enthusiast',
                      location: 'New York, NY',
                      website: 'https://johndoe.dev',
                      socialLinks: {
                        twitter: '@johndoe',
                        linkedin: 'johndoe'
                      }
                    },
                    preferences: {
                      newsletter: true,
                      notifications: {
                        email: true,
                        push: false,
                        sms: false
                      },
                      theme: 'dark',
                      language: 'en'
                    },
                    stats: {
                      ordersCount: 15,
                      totalSpent: 1250.99,
                      loyaltyPoints: 1250
                    },
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-15T00:00:00Z',
                    lastLoginAt: '2024-01-16T10:30:00Z'
                  },
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 404,
                      description: 'User not found',
                      error: 'USER_NOT_FOUND',
                      message: 'User with the specified ID does not exist'
                    },
                    {
                      status: 401,
                      description: 'Unauthorized',
                      error: 'UNAUTHORIZED',
                      message: 'Authentication required'
                    },
                    {
                      status: 403,
                      description: 'Forbidden',
                      error: 'ACCESS_DENIED',
                      message: 'You can only view your own profile or need admin privileges'
                    }
                  ]
                }
              ]
            },
            {
              id: 'profiles',
              name: 'User Profiles',
              description: 'Manage user profile information and preferences',
              endpoints: [
                {
                  method: 'PUT',
                  path: '/users/:id/profile',
                  summary: 'Update User Profile',
                  description: 'Update user profile information including avatar, bio, and social links',
                  requiresAuth: true,
                  tags: ['users', 'profile', 'update'],
                  requestBody: {
                    avatar: 'https://example.com/new-avatar.jpg',
                    bio: 'Updated bio - Full-stack developer passionate about clean code',
                    location: 'San Francisco, CA',
                    website: 'https://johndoe.dev',
                    socialLinks: {
                      twitter: '@johndoe_dev',
                      linkedin: 'johndoe-dev',
                      github: 'johndoe'
                    }
                  },
                  successData: {
                    id: 1,
                    profile: {
                      avatar: 'https://example.com/new-avatar.jpg',
                      bio: 'Updated bio - Full-stack developer passionate about clean code',
                      location: 'San Francisco, CA',
                      website: 'https://johndoe.dev',
                      socialLinks: {
                        twitter: '@johndoe_dev',
                        linkedin: 'johndoe-dev',
                        github: 'johndoe'
                      }
                    },
                    updatedAt: '2024-01-20T00:00:00Z'
                  },
                  successMessage: 'Profile updated successfully',
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 403,
                      description: 'Forbidden',
                      error: 'FORBIDDEN',
                      message: 'You can only update your own profile'
                    },
                    {
                      status: 404,
                      description: 'User not found',
                      error: 'USER_NOT_FOUND',
                      message: 'User with the specified ID does not exist'
                    },
                    {
                      status: 400,
                      description: 'Invalid avatar URL',
                      error: 'INVALID_AVATAR_URL',
                      message: 'Avatar URL must be a valid image URL'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'products',
          name: 'Product Catalog',
          modules: [
            {
              id: 'products',
              name: 'Product Management',
              description: 'Manage product catalog, inventory, and pricing',
              endpoints: [
                {
                  method: 'GET',
                  path: '/products',
                  summary: 'Get Product Catalog',
                  description: 'Retrieve products with advanced filtering, sorting, and pagination',
                  requiresAuth: false,
                  tags: ['products', 'catalog', 'public'],
                  successData: {
                    products: [
                      {
                        id: 1,
                        name: 'MacBook Pro 16"',
                        description: 'Apple MacBook Pro 16-inch with M2 Pro chip',
                        price: 2499.00,
                        salePrice: 2299.00,
                        currency: 'USD',
                        category: {
                          id: 1,
                          name: 'Laptops',
                          slug: 'laptops'
                        },
                        brand: {
                          id: 1,
                          name: 'Apple',
                          slug: 'apple'
                        },
                        inStock: true,
                        stockQuantity: 25,
                        sku: 'MBP16-M2PRO-512',
                        images: [
                          {
                            url: 'https://example.com/products/mbp16-1.jpg',
                            alt: 'MacBook Pro 16 inch front view',
                            isPrimary: true
                          },
                          {
                            url: 'https://example.com/products/mbp16-2.jpg',
                            alt: 'MacBook Pro 16 inch side view',
                            isPrimary: false
                          }
                        ],
                        specifications: {
                          processor: 'Apple M2 Pro',
                          memory: '16GB',
                          storage: '512GB SSD',
                          display: '16.2-inch Liquid Retina XDR',
                          weight: '2.15 kg'
                        },
                        rating: {
                          average: 4.8,
                          count: 1247
                        },
                        tags: ['laptop', 'apple', 'professional', 'creative'],
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-15T00:00:00Z'
                      }
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 500,
                      totalPages: 25,
                      hasNext: true,
                      hasPrev: false
                    },
                    filters: {
                      category: null,
                      brand: null,
                      priceRange: {
                        min: null,
                        max: null
                      },
                      inStock: null,
                      rating: null,
                      search: null
                    },
                    sorting: {
                      field: 'createdAt',
                      order: 'desc'
                    }
                  },
                  successStatus: 200,
                  errorResponses: [
                    {
                      status: 400,
                      description: 'Invalid filter parameters',
                      error: 'INVALID_FILTERS',
                      message: 'One or more filter parameters are invalid'
                    }
                  ]
                },
                {
                  method: 'POST',
                  path: '/products',
                  summary: 'Create New Product',
                  description: 'Add a new product to the catalog (Admin only)',
                  requiresAuth: true,
                  tags: ['products', 'create', 'admin'],
                  requestBody: {
                    name: 'iPhone 15 Pro',
                    description: 'Apple iPhone 15 Pro with A17 Pro chip',
                    price: 999.00,
                    categoryId: 2,
                    brandId: 1,
                    stockQuantity: 100,
                    sku: 'IPH15PRO-128-TIT',
                    images: [
                      {
                        url: 'https://example.com/products/iphone15pro-1.jpg',
                        alt: 'iPhone 15 Pro front view',
                        isPrimary: true
                      }
                    ],
                    specifications: {
                      processor: 'A17 Pro',
                      storage: '128GB',
                      display: '6.1-inch Super Retina XDR',
                      camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
                      weight: '187g'
                    },
                    tags: ['smartphone', 'apple', 'premium', '5g']
                  },
                  successData: {
                    id: 2,
                    name: 'iPhone 15 Pro',
                    description: 'Apple iPhone 15 Pro with A17 Pro chip',
                    price: 999.00,
                    currency: 'USD',
                    category: {
                      id: 2,
                      name: 'Smartphones',
                      slug: 'smartphones'
                    },
                    brand: {
                      id: 1,
                      name: 'Apple',
                      slug: 'apple'
                    },
                    inStock: true,
                    stockQuantity: 100,
                    sku: 'IPH15PRO-128-TIT',
                    slug: 'iphone-15-pro',
                    createdAt: '2024-01-20T00:00:00Z'
                  },
                  successMessage: 'Product created successfully',
                  successStatus: 201,
                  errorResponses: [
                    {
                      status: 400,
                      description: 'Validation error',
                      error: 'VALIDATION_ERROR',
                      message: 'Product name and price are required'
                    },
                    {
                      status: 401,
                      description: 'Unauthorized',
                      error: 'UNAUTHORIZED',
                      message: 'Authentication required'
                    },
                    {
                      status: 403,
                      description: 'Forbidden',
                      error: 'INSUFFICIENT_PERMISSIONS',
                      message: 'Admin privileges required to create products'
                    },
                    {
                      status: 409,
                      description: 'SKU already exists',
                      error: 'DUPLICATE_SKU',
                      message: 'A product with this SKU already exists'
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
})
export class AppModule {}
```

## 🔄 Dynamic Configuration

### Async Configuration

```typescript
StructuredZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const environment = configService.get('NODE_ENV');
    const isDevelopment = environment === 'development';
    
    return {
      title: configService.get('API_TITLE'),
      description: configService.get('API_DESCRIPTION'),
      version: configService.get('API_VERSION'),
      theme: {
        preset: isDevelopment ? 'insomnia' : 'postman',
        mode: isDevelopment ? 'light' : 'dark',
      },
      environment: {
        variables: [
          {
            name: 'accessToken',
            value: isDevelopment ? configService.get('DEV_ACCESS_TOKEN') : '',
            description: 'JWT access token',
            type: 'token',
            sensitive: true,
          }
        ],
        headers: {
          'X-Environment': environment,
        }
      },
      sections: await loadSectionsFromDatabase() // Load from external source
    };
  },
  inject: [ConfigService],
})
```

### Runtime Configuration

```typescript
// In your main.ts or bootstrap function
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure structured documentation at runtime
  const dynamicConfig = await buildConfigurationFromAPI();
  StructuredZedocModule.configure(app, dynamicConfig);
  
  await app.listen(3000);
}
```

## 🎯 Features

### ✅ Structured Organization
- **Hierarchical Structure**: Sections → Modules → Endpoints
- **Logical Grouping**: Organize related functionality together
- **Clear Navigation**: Intuitive sidebar with section/module hierarchy

### ✅ Authentication Support
- **Auth Indicators**: Visual indicators for endpoints requiring authentication
- **Environment Variables**: Comprehensive token and credential management
- **Try It Out**: Interactive testing with automatic auth header injection

### ✅ Rich Endpoint Documentation
- **Request/Response Examples**: Complete JSON examples
- **Error Handling**: Detailed error response documentation
- **Headers & Parameters**: Additional headers and query parameters
- **Success Scenarios**: Multiple success response formats

### ✅ Advanced Theming
- **All Existing Themes**: Compatible with basic, postman, insomnia, swagger
- **Custom Styling**: Full color and font customization
- **Responsive Design**: Mobile-friendly documentation

### ✅ Interactive Features
- **Search & Filter**: Real-time search and tag-based filtering
- **Try Panel**: Interactive API testing with environment variables
- **Collapsible Sections**: Organized, collapsible navigation

### ✅ Branding Integration
- **Logo Support**: Header and sidebar logo positioning
- **Cover Images**: Hero sections and background images
- **Favicon**: Custom favicon support

## 🔄 Migration from Swagger-based Architecture

The structured architecture complements the existing Swagger-based system:

### Swagger-based (Existing)
```typescript
// Uses Swagger decorators and automatic extraction
ZedocModule.forRoot({
  title: 'API Documentation',
  theme: { preset: 'postman' }
})
```

### Structured Architecture (New)
```typescript
// Uses manual configuration with structured data
StructuredZedocModule.forRoot({
  title: 'Structured API Documentation',
  sections: [/* manual configuration */]
})
```

### Use Cases

**Use Swagger-based when:**
- You have existing Swagger decorators
- You want automatic documentation extraction
- You prefer decorator-based documentation

**Use Structured Architecture when:**
- You need precise control over documentation organization
- You want to document external APIs
- You need complex hierarchical organization
- You're building documentation portals

## 📚 API Reference

### StructuredZedocModule

```typescript
class StructuredZedocModule {
  static forRoot(config?: NewDocumentationConfig): DynamicModule
  static forRootAsync(options: AsyncOptions): DynamicModule
  static configure(app: any, config: NewDocumentationConfig): void
}
```

### StructuredDocumentationService

```typescript
class StructuredDocumentationService {
  setConfig(config: NewDocumentationConfig): void
  getConfig(): NewDocumentationConfig
  generateStructuredDocumentation(): string
  convertEndpointConfigToApiEndpoint(endpoint: EndpointConfig): ApiEndpoint
}
```

### StructuredDocumentationController

```typescript
@Controller('structured-docs')
class StructuredDocumentationController {
  @Get() getStructuredDocumentation(@Res() res: Response): void
  @Get('config') getStructuredConfig(): NewDocumentationConfig
}
```

## 🎯 Best Practices

### 1. Logical Organization
```typescript
// Group related functionality into sections
sections: [
  {
    id: 'auth',
    name: 'Authentication & Security',
    modules: [
      { id: 'user-auth', name: 'User Authentication', ... },
      { id: 'admin-auth', name: 'Admin Authentication', ... },
      { id: 'oauth', name: 'OAuth Integration', ... }
    ]
  }
]
```

### 2. Consistent Naming
```typescript
// Use consistent ID and naming conventions
{
  id: 'user-management',  // kebab-case for IDs
  name: 'User Management', // Title Case for names
  modules: [
    {
      id: 'users',
      name: 'User Operations',
      endpoints: [
        {
          method: 'GET',
          path: '/users',
          summary: 'Get All Users', // Clear, action-oriented summaries
        }
      ]
    }
  ]
}
```

### 3. Comprehensive Error Documentation
```typescript
errorResponses: [
  {
    status: 400,
    description: 'Validation error',
    error: 'VALIDATION_ERROR',
    message: 'Specific validation failure message'
  },
  {
    status: 401,
    description: 'Unauthorized',
    error: 'UNAUTHORIZED',
    message: 'Authentication required'
  },
  {
    status: 403,
    description: 'Forbidden',
    error: 'INSUFFICIENT_PERMISSIONS',
    message: 'Admin privileges required'
  }
]
```

### 4. Environment Variables Organization
```typescript
environment: {
  variables: [
    // Group by type
    // Authentication tokens
    { name: 'accessToken', type: 'token', sensitive: true },
    { name: 'refreshToken', type: 'token', sensitive: true },
    
    // Configuration
    { name: 'baseUrl', type: 'custom', sensitive: false },
    { name: 'apiVersion', type: 'custom', sensitive: false },
    
    // Default parameters
    { name: 'userId', type: 'query', sensitive: false },
    { name: 'pageSize', type: 'query', sensitive: false }
  ]
}
```

## 🚀 Getting Started

1. **Install the library** (if not already installed):
   ```bash
   npm install @kodesonik/zedoc
   ```

2. **Import the structured module**:
   ```typescript
   import { StructuredZedocModule } from '@kodesonik/zedoc';
   ```

3. **Configure your documentation structure**:
   ```typescript
   StructuredZedocModule.forRoot({
     title: 'My API',
     description: 'Structured API documentation',
     sections: [/* your sections */]
   })
   ```

4. **Access your documentation**:
   - Documentation: `http://localhost:3000/structured-docs`
   - Configuration: `http://localhost:3000/structured-docs/config`

The structured architecture provides a powerful way to create comprehensive, well-organized API documentation with full environment variables support! 🏗️✨ 