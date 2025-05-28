# @kodesonik/zedoc

A comprehensive NestJS library for generating beautiful, interactive API documentation with advanced theming, sidebar navigation, environment variables, and branding support.

## ✨ Features

- **🔄 Unified Architecture**: Single module supporting both Swagger-based automatic extraction and structured manual configuration
- **🎨 Advanced Theming**: 4 built-in themes (basic, postman, insomnia, swagger) with full customization
- **🧭 Smart Sidebar**: Configurable navigation with search, filtering, and collapsible panels
- **🔤 Typography System**: 3 font size presets and 3 font families with responsive design
- **🌍 Environment Variables**: Comprehensive token management with 5 variable types
- **🎯 Branding Support**: Favicon, logo, and cover image customization
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **🔒 Authentication**: Visual indicators and token management for secured endpoints
- **⚡ Try It Out Panel**: Interactive API testing with environment variable integration

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
      description: 'Comprehensive API documentation with all features',
      version: '1.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
        fonts: {
          size: 'md',
          family: 'inter'
        }
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        try: {
          enabled: true,
          position: 'auto'
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
          }
        ],
        defaultTokens: {
          accessToken: '',
          apiKey: '',
        },
        headers: {
          'X-Client-Version': '1.0.0',
          'Accept': 'application/json',
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
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return [];
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: any) {
    return {};
  }
}
```

## 📚 Documentation Modes

### Swagger Mode (Automatic)

Automatically extracts documentation from your existing Swagger decorators:

- ✅ **Zero Configuration**: Works with existing `@ApiTags`, `@ApiOperation`, etc.
- ✅ **Real-time Updates**: Documentation updates as you modify decorators
- ✅ **Type Safety**: Leverages TypeScript types and Swagger schemas
- ✅ **Standard Compliance**: Uses OpenAPI/Swagger standards

### Structured Mode (Manual)

Manually configure documentation with hierarchical organization:

```typescript
ZedocModule.forRoot({
  title: 'Structured API Documentation',
  description: 'Manually configured with sections and modules',
  version: '1.0.0',
  // Presence of sections triggers structured mode
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
                user: { id: 1, email: 'user@example.com' }
              },
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

- ✅ **Hierarchical Organization**: Sections → Modules → Endpoints
- ✅ **Rich Metadata**: Detailed request/response examples
- ✅ **Authentication Indicators**: Visual auth requirements
- ✅ **Error Documentation**: Comprehensive error response examples

## 🎨 Advanced Configuration

### Complete Configuration Example

```typescript
ZedocModule.forRoot({
  title: 'My Awesome API',
  description: 'Complete API documentation with all features',
  version: '2.0.0',
  basePath: '/api',
  tags: ['Users', 'Products', 'Orders'],
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  theme: {
    preset: 'postman',
    mode: 'light',
    colors: {
      primary: '#ff6c37',
      secondary: '#4a5568',
      success: '#48bb78'
    },
    fonts: {
      size: 'md',
      family: 'inter'
    }
  },
  sidebar: {
    position: 'left',
    width: '350px',
    searchbar: true,
    tagsFilter: true,
    collapsible: true,
    try: {
      enabled: true,
      position: 'auto',
      width: '450px',
      defaultExpanded: false
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
        name: 'userId',
        value: '123',
        description: 'Default user ID for testing',
        type: 'query',
        sensitive: false,
      }
    ],
    defaultTokens: {
      accessToken: process.env.DEFAULT_ACCESS_TOKEN || '',
      apiKey: process.env.DEFAULT_API_KEY || '',
    },
    headers: {
      'X-Client-Version': '1.0.0',
      'Accept': 'application/json',
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
    },
    cover: {
      src: '/hero-image.jpg',
      alt: 'API Documentation',
      position: 'hero',
      height: '300px',
      overlay: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)'
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
      theme: {
        preset: 'postman',
        mode: isDevelopment ? 'light' : 'dark',
        fonts: {
          size: isDevelopment ? 'lg' : 'md',  // Larger fonts in development
          family: 'inter'
        }
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
            name: 'accessToken',
            value: isDevelopment ? configService.get('DEV_ACCESS_TOKEN') : '',
            description: 'JWT access token',
            type: 'token',
            sensitive: true,
          }
        ],
        defaultTokens: {
          accessToken: configService.get('DEFAULT_ACCESS_TOKEN'),
        },
        headers: {
          'X-Environment': isDevelopment ? 'development' : 'production',
        }
      }
    };
  },
  inject: [ConfigService],
})
```

## 📚 Documentation Guides

- **[Theme Configuration Guide](THEME_EXAMPLES.md)** - Complete theming documentation
- **[Sidebar Configuration Guide](SIDEBAR_CONFIGURATION.md)** - Comprehensive sidebar setup
- **[Font Configuration Guide](FONT_CONFIGURATION.md)** - Typography and font customization
- **[Environment Variables Guide](ENVIRONMENT_CONFIGURATION.md)** - Authentication and configuration management
- **[Branding Configuration Guide](BRANDING_CONFIGURATION.md)** - Favicon, logo, and cover image customization

## 🔗 API Endpoints

Once configured, Zedoc provides these endpoints:

- `GET /docs` - Main documentation interface (unified for both modes)
- `GET /docs/config` - Current configuration (JSON)
- `GET /docs/json` - Swagger JSON (Swagger mode only)
- `GET /docs/endpoints` - Transformed endpoints (Swagger mode only)

## 🎯 Use Cases

### For API Documentation
```typescript
// Focus on clean, comprehensive documentation
sidebar: {
  position: 'left',
  width: '320px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: false  // Focus on documentation
  }
}
```

### For Interactive Testing
```typescript
// Enable full interactive capabilities
sidebar: {
  position: 'left',
  width: '300px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: true,
    position: 'right',
    width: '450px',
    defaultExpanded: false
  }
}
```

### For Mobile-First
```typescript
// Optimize for mobile devices
sidebar: {
  position: 'left',
  width: '280px',
  searchbar: true,
  tagsFilter: false,  // Simplify mobile experience
  collapsible: true,  // Must-have for mobile
  try: {
    enabled: false    // Avoid clutter on mobile
  }
}
```

## 🚀 Migration Guide

### From Separate Modules

If you were using `StructuredZedocModule`, simply replace it with `ZedocModule`:

```typescript
// Before
import { StructuredZedocModule } from '@kodesonik/zedoc';
StructuredZedocModule.forRoot({ sections: [...] })

// After
import { ZedocModule } from '@kodesonik/zedoc';
ZedocModule.forRoot({ sections: [...] })  // Auto-detects structured mode
```

### Mode Detection

The unified module automatically detects the mode:

- **Structured Mode**: When `sections` array is provided
- **Swagger Mode**: When no `sections` are provided (default)
- **Explicit Mode**: Set `mode: 'swagger'` or `mode: 'structured'` to override auto-detection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ using:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Swagger](https://swagger.io/) - API documentation standard
- [Handlebars](https://handlebarsjs.com/) - Template engine
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework 