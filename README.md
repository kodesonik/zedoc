# @kodesonik/zedoc

A comprehensive NestJS library for generating beautiful, interactive API documentation with advanced theming, environment variables, and professional testing capabilities.

## ✨ Features

- **🔄 Unified Architecture**: Single module supporting both Swagger-based automatic extraction and structured manual configuration
- **🎨 4 Built-in Themes**: Professional presets (Default/Solarized, Postman, Insomnia, Swagger) with runtime switching
- **🧭 Smart Sidebar**: Configurable navigation with search, filtering, collapsible panels, and active section tracking
- **🔤 Typography System**: Multiple font families with responsive design and accessibility features
- **🌍 Advanced Environment Variables**: Comprehensive variable system with `{}` URL placeholders and `{{}}` environment tokens
- **⚡ Enhanced Try Panel**: Pre-filled requests with intelligent variable replacement and type-aware parameter handling
- **📊 Professional Parameter Tables**: Clean, responsive tables with type indicators and required field markers
- **🎯 Branding Support**: Favicon, logo, and cover image customization
- **📱 Mobile-First Design**: Responsive layouts optimized for all device sizes
- **🔒 Authentication**: Visual indicators and seamless token management for secured endpoints

## 🚀 Quick Start

### Installation

```bash
npm install @kodesonik/zedoc
```

### Basic Setup (Swagger Mode)

For automatic documentation extraction from Swagger decorators:

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'Professional API documentation with enhanced testing',
      version: '1.0.0',
      baseUrl: 'https://api.example.com',
      theme: {
        preset: 'postman', // 'default', 'postman', 'insomnia', 'swagger'
        mode: 'light',
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        try: {
          enabled: true,
          position: 'right'
        }
      }
    }),
  ],
})
export class AppModule {}
```

### Set up Swagger integration

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZedocModule } from '@kodesonik/zedoc';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Connect Zedoc with Swagger
  ZedocModule.setSwaggerDocument(app, document);

  await app.listen(3000);
}
bootstrap();
```

### Use standard Swagger decorators

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return {};
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: any) {
    return {};
  }
}
```

## 🎨 Theme System

Zedoc features 4 professional theme presets that can be switched at runtime:

### 📚 Default Theme (Solarized Book)
Classic book-inspired design with warm solarized colors and elegant typography. Perfect for comprehensive documentation reading.

### 🚀 Postman Theme
Modern professional interface with bold orange accents and glass-morphism effects. Ideal for API testing workflows.

### 💜 Insomnia Theme  
Ultra-minimal clean design with subtle purple highlights. Great for distraction-free documentation.

### ⚙️ Swagger Theme
Technical developer-focused theme with structured green colors and monospace fonts. Perfect for API specification review.

```typescript
ZedocModule.forRoot({
  theme: {
    preset: 'postman', // Runtime theme switching available in UI
    mode: 'light',     // 'light' or 'dark' modes for all themes
  }
})
```

## 🌍 Environment Variables & Testing

### Advanced Variable System

Zedoc supports a sophisticated variable replacement system:

- **`{variable}`** - Single brackets for URL path parameters
- **`{{VARIABLE}}`** - Double brackets for environment variables in headers/body

```typescript
ZedocModule.forRoot({
  baseUrl: '{BASE_URL}', // Will be replaced with environment variable
  environment: {
    variables: [
      {
        name: 'BASE_URL',
        value: 'https://api.example.com',
        description: 'Base URL for all API endpoints'
      },
      {
        name: 'API_TOKEN',
        value: 'your-api-token-here',
        description: 'Authorization token for API requests'
      },
      {
        name: 'USER_ID',
        value: '123',
        description: 'Default user ID for testing'
      }
    ],
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{API_TOKEN}}'
    }
  }
})
```

### Enhanced Try Panel

The try panel automatically:
- **Pre-fills** all parameters from endpoint documentation
- **Replaces variables** in URLs, headers, and request bodies
- **Syncs environment** between main config and try panel
- **Shows parameters** as form tables (always visible, regardless of HTTP method)
- **Handles types** intelligently (path vs query vs header parameters)

Example URL construction:
```
Original: /users/{id}/posts?page={{PAGE}}&limit={{LIMIT}}
Result:   /users/123/posts?page=1&limit=10
```

## 📊 Professional Parameter Documentation

Parameters are now displayed as professional tables instead of JSON blocks:

| Name | Type | In | Description | Example |
|------|------|----|-----------  |---------|
| id* | string | path | User identifier | `123` |
| page | integer | query | Page number for pagination | `1` |
| Authorization* | string | header | Bearer token for authentication | `Bearer token123` |

- **Required fields** marked with red asterisk (*)
- **Type indicators** with syntax highlighting
- **Location context** (path, query, header, body)
- **Example values** with proper formatting
- **Responsive design** for mobile devices

## 📚 Documentation Modes

### Swagger Mode (Automatic)

Automatically extracts documentation from your existing Swagger decorators:

- ✅ **Zero Configuration**: Works with existing `@ApiTags`, `@ApiOperation`, etc.
- ✅ **Real-time Updates**: Documentation updates as you modify decorators
- ✅ **Parameter Tables**: Professional display of all parameter types
- ✅ **Enhanced Try Panel**: Pre-filled with endpoint data and variable replacement
- ✅ **Type Safety**: Leverages TypeScript types and Swagger schemas

### Structured Mode (Manual)

Manually configure documentation with hierarchical organization:

```typescript
ZedocModule.forRoot({
  title: 'Structured API Documentation',
  description: 'Manually configured with sections and modules',
  version: '1.0.0',
  baseUrl: '{BASE_URL}',
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
              parameters: [
                {
                  name: 'email',
                  type: 'string',
                  in: 'body',
                  required: true,
                  description: 'User email address',
                  example: 'user@example.com'
                },
                {
                  name: 'password', 
                  type: 'string',
                  in: 'body',
                  required: true,
                  description: 'User password',
                  example: 'password123'
                }
              ],
              requestHeaders: [
                {
                  name: 'Content-Type',
                  type: 'string',
                  required: true,
                  description: 'Request content type',
                  example: 'application/json'
                }
              ],
              requestBody: {
                email: 'user@example.com',
                password: 'password123'
              },
              successResponse: {
                accessToken: 'jwt_token_here',
                user: { id: 1, email: 'user@example.com' }
              },
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

## 🎯 Advanced Configuration

### Complete Configuration Example

```typescript
ZedocModule.forRoot({
  title: 'My Awesome API',
  description: 'Complete API documentation with all features',
  version: '2.0.0',
  baseUrl: '{BASE_URL}',
  tags: ['Users', 'Products', 'Orders'],
  theme: {
    preset: 'postman',     // Theme preset with runtime switching
    mode: 'light',         // Light/dark mode
  },
  sidebar: {
    position: 'left',
    width: '300px',
    searchbar: true,       // Search through endpoints
    tagsFilter: true,      // Filter by tags/roles
    collapsible: true,     // Collapsible sections
    try: {
      enabled: true,       // Enable try panel
      position: 'right',   // Panel position
      width: '600px',      // Panel width
      defaultExpanded: false
    }
  },
  environment: {
    variables: [
      {
        name: 'BASE_URL',
        value: 'https://api.example.com',
        description: 'Base URL for all API endpoints'
      },
      {
        name: 'API_TOKEN',
        value: '',
        description: 'Authorization token for API requests'
      },
      {
        name: 'USER_ID',
        value: '123',
        description: 'Default user ID for testing'
      }
    ],
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{API_TOKEN}}',
      'X-Client-Version': '1.0.0'
    }
  },
  branding: {
    favicon: '/favicon.ico',
    logo: {
      src: '/logo.svg',
      alt: 'Company Logo',
      height: '40px',
      position: 'both',
      link: 'https://company.com'
    }
  }
})
```

### Async Configuration

```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    
    return {
      title: configService.get('API_TITLE'),
      description: configService.get('API_DESCRIPTION'),
      version: configService.get('API_VERSION'),
      baseUrl: configService.get('API_BASE_URL'),
      theme: {
        preset: isDevelopment ? 'postman' : 'swagger',
        mode: 'light',
      },
      sidebar: {
        position: 'left',
        try: {
          enabled: isDevelopment,  // Only in development
          defaultExpanded: isDevelopment
        }
      },
      environment: {
        variables: [
          {
            name: 'BASE_URL',
            value: configService.get('API_BASE_URL'),
            description: 'API base URL'
          },
          {
            name: 'API_TOKEN',
            value: isDevelopment ? configService.get('DEV_API_TOKEN') : '',
            description: 'API authentication token'
          }
        ],
        defaultHeaders: {
          'X-Environment': isDevelopment ? 'development' : 'production',
        }
      }
    };
  },
  inject: [ConfigService],
})
```

## 🔗 API Endpoints

Once configured, Zedoc provides these endpoints:

- `GET /docs` - Main documentation interface with theme selector
- `GET /docs?preset=postman` - Direct theme access
- `GET /docs?theme=dark` - Direct theme mode access
- `GET /docs/config` - Current configuration (JSON)
- `GET /docs/json` - Swagger JSON (Swagger mode only)
- `GET /docs/assets/*` - Theme assets and JavaScript

## ⚡ Key Features in Detail

### Variable Replacement System
- **URL Variables**: `{BASE_URL}/users/{id}` → `https://api.example.com/users/123`
- **Environment Variables**: `{{API_TOKEN}}` in headers/body → actual token value
- **Automatic Sync**: Environment changes reflect instantly in try panel

### Professional Parameter Tables
- **Clean Design**: Replace JSON blocks with structured tables
- **Type Awareness**: Visual indicators for string, integer, boolean, etc.
- **Required Indicators**: Red asterisk (*) for required fields
- **Context Clarity**: Shows where parameters go (path, query, header, body)
- **Example Values**: Properly formatted code examples

### Enhanced Try Panel
- **Pre-filled Data**: Automatically populated from endpoint documentation
- **Smart Parameter Forms**: Always-visible parameter tables for all HTTP methods
- **Variable Integration**: Seamless environment variable replacement
- **Response Export**: Export API responses as JSON
- **Mobile Optimized**: Responsive design for mobile testing

### Theme System
- **Runtime Switching**: Change themes without page reload
- **Consistent Design**: All 4 themes maintain feature parity
- **Accessibility**: Proper contrast ratios and ARIA support
- **Mobile Responsive**: Optimized layouts for all screen sizes

## 🎯 Use Cases

### For API Documentation
```typescript
// Clean, professional documentation focus
{
  theme: { preset: 'default' },
  sidebar: {
    searchbar: true,
    tagsFilter: true,
    try: { enabled: false }  // Documentation only
  }
}
```

### For Interactive Testing
```typescript
// Full testing capabilities
{
  theme: { preset: 'postman' },
  sidebar: {
    try: {
      enabled: true,
      position: 'right',
      defaultExpanded: true
    }
  }
}
```

### For Developer Teams
```typescript
// Technical focus with comprehensive features
{
  theme: { preset: 'swagger' },
  sidebar: {
    searchbar: true,
    tagsFilter: true,
    try: { enabled: true }
  }
}
```

### For Mobile-First
```typescript
// Optimized for mobile devices
{
  theme: { preset: 'insomnia' },  // Minimal, clean design
  sidebar: {
    width: '280px',
    tagsFilter: false,           // Simplify mobile experience
    collapsible: true,           // Essential for mobile
    try: { enabled: false }      // Reduce mobile complexity
  }
}
```

## 🚀 Migration Guide

### From Previous Versions

The new unified architecture maintains backward compatibility:

```typescript
// v1.x - Still works
import { StructuredZedocModule } from '@kodesonik/zedoc';
StructuredZedocModule.forRoot({ sections: [...] })

// v2.x - Recommended
import { ZedocModule } from '@kodesonik/zedoc';
ZedocModule.forRoot({ sections: [...] })  // Auto-detects structured mode
```

### New Environment Variable Syntax

Update your variable references:

```typescript
// Old syntax (still supported)
baseUrl: 'https://api.example.com'

// New syntax (recommended)
baseUrl: '{BASE_URL}'  // Will be replaced with environment variable

// Headers with variables
defaultHeaders: {
  'Authorization': 'Bearer {{API_TOKEN}}'  // Double brackets for env vars
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/kodesonik/zedoc.git
cd zedoc
npm install
npm run build
npm run test
```

## 📄 License

This project is licensed under the MIT License. 