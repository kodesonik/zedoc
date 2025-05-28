# @kodesonik/zedoc

A NestJS library for generating beautiful API documentation with Swagger integration, comprehensive theming, sidebar navigation, font customization, environment variables management, and interactive "Try It Out" functionality.

## Features

- 🚀 Easy integration with NestJS applications
- 📚 Beautiful HTML documentation generation with Swagger integration
- 🎨 Comprehensive theming system with 4 preset themes and full customization
- 🔤 Advanced typography system with 3 font size presets and 3 font families
- 🧭 Advanced sidebar navigation with search and filtering
- 🌍 Environment variables management for authentication and configuration
- 🔧 Interactive "Try It Out" panel for API testing
- 📱 Fully responsive design for all devices
- 🌙 Dark/light mode support
- 🔍 Real-time search and tags filtering
- 🎯 Tailwind CSS styling for modern UI
- 🔧 Customizable Handlebars templates

## Installation

```bash
npm install @kodesonik/zedoc
```

## Quick Start

### 1. Import the module with comprehensive configuration

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

### 2. Set up Swagger integration

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

### 3. Use standard Swagger decorators

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system'
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  findOne(@Param('id') id: string) {
    return {};
  }
}
```

### 4. Access your documentation

- **Zedoc Documentation**: Navigate to `/docs` for the beautiful themed documentation
- **Swagger UI**: Navigate to `/api` for the standard Swagger interface
- **Swagger JSON**: Navigate to `/api-json` for the raw Swagger document

## 🎨 Theme Configuration

### Preset Themes

Choose from 4 beautiful preset themes:

```typescript
// Postman-inspired theme
theme: { preset: 'postman', mode: 'light' }

// Insomnia-inspired theme  
theme: { preset: 'insomnia', mode: 'light' }

// Swagger-inspired theme
theme: { preset: 'swagger', mode: 'light' }

// Basic clean theme (default)
theme: { preset: 'basic', mode: 'light' }
```

### Dark Mode

All themes support dark mode:

```typescript
theme: {
  preset: 'postman',
  mode: 'dark'  // or 'light'
}
```

### Custom Colors

Full color customization:

```typescript
theme: {
  preset: 'custom',
  mode: 'light',
  colors: {
    primary: '#ff6c37',
    secondary: '#4a5568',
    success: '#48bb78',
    warning: '#ed8936',
    danger: '#f56565',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    border: '#e5e5e5'
  }
}
```

## 🔤 Font Configuration

### Font Size Presets

Choose from 3 carefully crafted size scales:

```typescript
// Small - Compact display
fonts: { size: 'sm' }

// Medium - Balanced (default)
fonts: { size: 'md' }

// Large - Accessibility focused
fonts: { size: 'lg' }
```

### Font Family Options

Select from 3 distinct font families:

```typescript
// Inter - Modern UI font
fonts: { family: 'inter' }

// Roboto - Google's signature font
fonts: { family: 'roboto' }

// System - Native OS fonts
fonts: { family: 'system' }
```

### Complete Font Configuration

```typescript
theme: {
  fonts: {
    size: 'md',           // 'sm' | 'md' | 'lg' | 'custom'
    family: 'inter',      // 'inter' | 'roboto' | 'system' | 'custom'
    customSizes: {        // Optional custom sizes
      base: '1.125rem',
      lg: '1.375rem',
      xl: '1.75rem'
    },
    customFamily: '"Poppins", sans-serif'  // Optional custom font
  }
}
```

## 🌍 Environment Variables Configuration

### Basic Environment Setup

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
      name: 'apiKey',
      value: '',
      description: 'API key for service authentication',
      type: 'token',
      sensitive: true,
    }
  ],
  defaultTokens: {
    accessToken: '',
    refreshToken: '',
    apiKey: '',
    bearerToken: '',
  },
  headers: {
    'X-Client-Version': '1.0.0',
    'Accept': 'application/json',
  },
  queryParams: {
    'version': 'v1',
  }
}
```

### Variable Types

**Token Variables (type: 'token')**
- Automatically map to Authorization headers
- Support for JWT, API keys, bearer tokens
- Secure password input fields

**Header Variables (type: 'header')**
- Custom HTTP headers
- Client identification and versioning

**Query Variables (type: 'query')**
- Default query parameters
- Pagination and filter settings

**Body Variables (type: 'body')**
- Request body templates
- Default payloads for testing

**Custom Variables (type: 'custom')**
- Configuration values and URLs
- Custom application settings

### Environment Features

- **🔐 Secure Storage**: Sensitive variables use password fields
- **💾 Persistence**: Variables saved to localStorage
- **🔄 Auto-Apply**: Smart header mapping for tokens
- **🎯 Try Panel Integration**: Seamless API testing
- **🌍 Multi-Environment**: Support for dev/staging/prod configs

## 🧭 Sidebar Configuration

### Basic Sidebar Setup

```typescript
sidebar: {
  position: 'left',        // 'left' | 'right' | 'none'
  searchbar: true,         // Enable search functionality
  tagsFilter: true,        // Enable tags filtering
  collapsible: true,       // Allow sidebar collapse
  width: '320px',          // Sidebar width
  try: {
    enabled: true,         // Enable "Try It Out" panel
    position: 'auto',      // Auto-position opposite to sidebar
    width: '400px',        // Try panel width
    defaultExpanded: false // Start collapsed
  }
}
```

### Sidebar Features

- **🔍 Real-time Search**: Search through endpoints, methods, and descriptions
- **🏷️ Tags Filtering**: Filter endpoints by Swagger tags
- **📱 Mobile Responsive**: Auto-collapse on mobile devices
- **🎯 Smart Navigation**: Click endpoints to scroll and highlight
- **⚙️ Try It Out Panel**: Interactive API testing with environment variables

### Layout Options

```typescript
// Classic left sidebar + right try panel
sidebar: { position: 'left', try: { enabled: true, position: 'auto' } }

// Right sidebar + left try panel  
sidebar: { position: 'right', try: { enabled: true, position: 'auto' } }

// No sidebar, just try panel
sidebar: { position: 'none', try: { enabled: true, position: 'right' } }

// Full-width documentation
sidebar: { position: 'none', try: { enabled: false } }
```

## Configuration

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

## API Reference

### Interfaces

#### DocumentationConfig

```typescript
interface DocumentationConfig {
  title?: string;
  description?: string;
  version?: string;
  basePath?: string;
  tags?: string[];
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
}
```

#### ThemeConfig

```typescript
interface ThemeConfig {
  preset?: 'basic' | 'postman' | 'insomnia' | 'swagger' | 'custom';
  mode?: 'light' | 'dark';
  colors?: ThemeColors;
  fonts?: FontConfig;
}
```

#### FontConfig

```typescript
interface FontConfig {
  size?: 'sm' | 'md' | 'lg' | 'custom';
  family?: 'inter' | 'roboto' | 'system' | 'custom';
  customSizes?: FontSizes;
  customFamily?: string;
}
```

#### SidebarConfig

```typescript
interface SidebarConfig {
  position?: 'left' | 'right' | 'none';
  try?: TryPanelConfig;
  searchbar?: boolean;
  tagsFilter?: boolean;
  collapsible?: boolean;
  width?: string;
}
```

#### EnvironmentConfig

```typescript
interface EnvironmentConfig {
  variables?: EnvironmentVariable[];
  defaultTokens?: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    bearerToken?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}
```

#### EnvironmentVariable

```typescript
interface EnvironmentVariable {
  name: string;
  value: string;
  description?: string;
  type?: 'token' | 'header' | 'query' | 'body' | 'custom';
  sensitive?: boolean;
}
```

### Services

#### DocumentationService

The main service for generating documentation from Swagger.

```typescript
class DocumentationService {
  setConfig(config: DocumentationConfig): void;
  getConfig(): DocumentationConfig;
  generateDocumentationFromSwagger(swaggerDoc: any): string;
  transformSwaggerToEndpoints(swaggerDoc: any): EndpointInfo[];
}
```

#### ThemeService

Service for managing themes and generating theme-specific CSS.

```typescript
class ThemeService {
  getResolvedTheme(themeConfig?: ThemeConfig): ThemeColors;
  generateThemeCSS(themeConfig?: ThemeConfig): string;
  generateMethodColors(themeConfig?: ThemeConfig): string;
}
```

#### FontService

Service for managing typography and font configurations.

```typescript
class FontService {
  getResolvedFontConfig(fontConfig?: FontConfig): Required<FontConfig>;
  generateFontCSS(fontConfig?: FontConfig): string;
  generateResponsiveFontCSS(fontConfig?: FontConfig): string;
  getFontClasses(fontConfig?: FontConfig): Record<string, string>;
}
```

#### SidebarService

Service for managing sidebar functionality and layout.

```typescript
class SidebarService {
  getResolvedSidebarConfig(sidebarConfig?: SidebarConfig): SidebarConfig;
  generateSidebarHTML(sidebarConfig: SidebarConfig, endpoints: EndpointInfo[], tags: string[]): string;
  generateSidebarCSS(sidebarConfig: SidebarConfig): string;
}
```

#### EnvironmentService

Service for managing environment variables and authentication.

```typescript
class EnvironmentService {
  getResolvedEnvironmentConfig(envConfig?: EnvironmentConfig): Required<EnvironmentConfig>;
  getVariablesByType(envConfig?: EnvironmentConfig, type?: string): EnvironmentVariable[];
  getAuthHeaders(envConfig?: EnvironmentConfig): Record<string, string>;
  generateEnvironmentHTML(envConfig?: EnvironmentConfig): string;
  generateEnvironmentJS(): string;
}
```

## Custom Templates

You can customize the documentation appearance by providing your own Handlebars templates. The library provides several helpers for theme, font, sidebar, and environment integration.

### Available Handlebars Helpers

```handlebars
<!-- Theme helpers -->
{{{themeCSS}}}
{{{methodColors}}}
{{themeClass 'body'}}

<!-- Font helpers -->
{{{fontCSS}}}
{{{responsiveFontCSS}}}
{{fontClass 'title'}}

<!-- Sidebar helpers -->
{{{sidebarHTML}}}
{{{tryPanelHTML}}}
{{{sidebarCSS}}}
{{{sidebarJS}}}

<!-- Environment helpers -->
{{{environmentHTML}}}
{{{environmentJS}}}

<!-- Utility helpers -->
{{endpointId endpoint}}
{{json object}}
{{uppercase string}}
{{lowercase string}}
```

## Migration from v1.x

If you're upgrading from v1.x, the library now uses Swagger as the foundation instead of custom decorators:

### Before (v1.x)
```typescript
@ApiDoc({
  summary: 'Get users',
  tags: ['Users']
})
```

### After (v2.x)
```typescript
@ApiOperation({ summary: 'Get users' })
@ApiTags('users')
```

The library automatically extracts documentation from your existing Swagger setup!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on [GitHub](https://github.com/kodesonik/zedoc/issues).

---

**@kodesonik/zedoc** - Beautiful API documentation made simple! 🎨✨ 