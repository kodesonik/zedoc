# 🔄 Unified Zedoc Architecture

The `@kodesonik/zedoc` library now features a **unified architecture** that seamlessly supports both Swagger-based automatic extraction and structured manual configuration in a single, powerful module.

## 🎯 Overview

### What Changed

**Before**: Two separate modules
- `ZedocModule` - For Swagger-based documentation
- `StructuredZedocModule` - For manual structured configuration

**After**: One unified module
- `ZedocModule` - Supports both modes with automatic detection

### Key Benefits

- ✅ **Simplified API**: Single module for all use cases
- ✅ **Automatic Mode Detection**: Intelligently switches between modes
- ✅ **Backward Compatibility**: Existing configurations work unchanged
- ✅ **Unified Features**: All features (themes, sidebar, environment, branding) work in both modes
- ✅ **Consistent Endpoints**: Same API endpoints regardless of mode

## 🔍 Mode Detection

The unified module automatically detects which mode to use:

### Swagger Mode (Default)
```typescript
ZedocModule.forRoot({
  title: 'My API',
  description: 'Swagger-based documentation',
  // No sections = Swagger mode
  theme: { preset: 'postman' }
})
```

### Structured Mode (Auto-detected)
```typescript
ZedocModule.forRoot({
  title: 'My API',
  description: 'Structured documentation',
  // Presence of sections = Structured mode
  sections: [
    {
      id: 'auth',
      name: 'Authentication',
      modules: [...]
    }
  ]
})
```

### Explicit Mode Override
```typescript
ZedocModule.forRoot({
  title: 'My API',
  mode: 'swagger', // Force swagger mode even with sections
  sections: [...] // Will be ignored
})
```

## 🏗️ Architecture Components

### Unified DocumentationService

The core service now handles both modes:

```typescript
class DocumentationService {
  // Mode detection
  private getDocumentationMode(): 'swagger' | 'structured'
  
  // Unified generation
  generateDocumentation(endpoints?: EndpointInfo[]): string
  generateStructuredDocumentation(): string
  
  // Swagger-specific
  transformSwaggerToEndpoints(swaggerDoc: any): EndpointInfo[]
  generateDocumentationFromSwagger(swaggerDoc: any): string
  
  // Structured-specific
  extractTagsFromSections(sections: SectionConfig[]): string[]
  generateStructuredSidebarHTML(...): string
}
```

### Unified DocumentationController

Single controller serving both modes:

```typescript
@Controller('docs')
class DocumentationController {
  @Get()
  async getDocumentation(@Res() res: Response) {
    const config = this.documentationService.getConfig();
    
    if (config.sections && config.sections.length > 0) {
      // Structured mode
      const html = this.documentationService.generateStructuredDocumentation();
      res.send(html);
    } else {
      // Swagger mode
      const swaggerDoc = await this.swaggerIntegrationService.getSwaggerDocument();
      const endpoints = this.documentationService.transformSwaggerToEndpoints(swaggerDoc);
      const html = this.documentationService.generateDocumentation(endpoints);
      res.send(html);
    }
  }
}
```

### Unified Template System

Single Handlebars template supporting both modes:

```handlebars
{{#if (eq mode 'structured')}}
<!-- Structured Documentation Layout -->
<div class="sections-container">
  {{#each sections}}
  <div class="section-card">
    <h2>{{name}}</h2>
    {{#each modules}}
    <div class="module-card">
      <h3>{{name}}</h3>
      {{#each endpoints}}
      <div class="endpoint-card">
        <!-- Structured endpoint display -->
      </div>
      {{/each}}
    </div>
    {{/each}}
  </div>
  {{/each}}
</div>
{{else}}
<!-- Swagger Documentation Layout -->
<div class="endpoints-container">
  {{#each endpoints}}
  <div class="endpoint-card">
    <!-- Swagger endpoint display -->
  </div>
  {{/each}}
</div>
{{/if}}
```

## 🔧 Configuration Interface

### Unified DocumentationConfig

```typescript
interface DocumentationConfig {
  // Common properties
  title?: string;
  description?: string;
  version?: string;
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
  
  // Mode control
  mode?: 'swagger' | 'structured' | 'auto';
  
  // Swagger-specific
  basePath?: string;
  tags?: string[];
  servers?: Array<{ url: string; description?: string; }>;
  
  // Structured-specific
  sections?: SectionConfig[];
}
```

### Template Data Interfaces

```typescript
// Unified template data
interface UnifiedTemplateData {
  title: string;
  description?: string;
  version?: string;
  mode: 'swagger' | 'structured';
  
  // Swagger mode data
  endpoints?: EndpointInfo[];
  
  // Structured mode data
  sections?: SectionConfig[];
  
  // Common data
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
  tags?: string[];
}
```

## 🚀 Usage Examples

### Swagger Mode Example

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZedocModule } from '@kodesonik/zedoc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger
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
```

```typescript
// app.module.ts
@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Swagger API Documentation',
      description: 'Auto-generated from Swagger decorators',
      theme: { preset: 'postman' },
      sidebar: { position: 'left', try: { enabled: true } }
    })
  ]
})
export class AppModule {}
```

### Structured Mode Example

```typescript
// app.module.ts
@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Structured API Documentation',
      description: 'Manually configured documentation',
      theme: { preset: 'insomnia' },
      sidebar: { position: 'left', try: { enabled: true } },
      sections: [
        {
          id: 'auth',
          name: 'Authentication',
          modules: [
            {
              id: 'login',
              name: 'Login Module',
              description: 'User authentication endpoints',
              endpoints: [
                {
                  method: 'POST',
                  path: '/auth/login',
                  summary: 'User Login',
                  description: 'Authenticate user credentials',
                  requiresAuth: false,
                  tags: ['auth'],
                  requestBody: {
                    email: 'user@example.com',
                    password: 'password123'
                  },
                  successData: {
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
  ]
})
export class AppModule {}
```

## 🔄 Migration Guide

### From ZedocModule (Swagger)

No changes needed! Your existing configuration works as-is:

```typescript
// This continues to work unchanged
ZedocModule.forRoot({
  title: 'My API',
  theme: { preset: 'postman' }
})
```

### From StructuredZedocModule

Simple import change:

```typescript
// Before
import { StructuredZedocModule } from '@kodesonik/zedoc';
StructuredZedocModule.forRoot({ sections: [...] })

// After
import { ZedocModule } from '@kodesonik/zedoc';
ZedocModule.forRoot({ sections: [...] })
```

### Runtime Configuration

Both modes support runtime configuration:

```typescript
// Swagger mode
ZedocModule.setSwaggerDocument(app, swaggerDocument);

// Structured mode
ZedocModule.configure(app, newConfig);
```

## 🎯 Best Practices

### When to Use Swagger Mode

- ✅ You already have Swagger decorators
- ✅ You want automatic documentation updates
- ✅ You prefer standard OpenAPI compliance
- ✅ You have existing Swagger tooling

### When to Use Structured Mode

- ✅ You need custom documentation organization
- ✅ You want detailed request/response examples
- ✅ You need hierarchical section/module structure
- ✅ You prefer manual control over content

### Hybrid Approach

You can even switch between modes dynamically:

```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const useStructured = configService.get('USE_STRUCTURED_DOCS');
    
    if (useStructured) {
      return {
        title: 'Structured Documentation',
        sections: await loadSectionsFromDatabase()
      };
    } else {
      return {
        title: 'Swagger Documentation',
        theme: { preset: 'swagger' }
      };
    }
  },
  inject: [ConfigService]
})
```

## 🔗 API Endpoints

Both modes use the same endpoints:

- `GET /docs` - Main documentation (unified)
- `GET /docs/config` - Configuration (shows current mode)
- `GET /docs/json` - Swagger JSON (Swagger mode only)
- `GET /docs/endpoints` - Transformed endpoints (Swagger mode only)

## 🎨 Feature Compatibility

All features work in both modes:

| Feature | Swagger Mode | Structured Mode |
|---------|--------------|-----------------|
| Themes | ✅ | ✅ |
| Sidebar | ✅ | ✅ |
| Fonts | ✅ | ✅ |
| Environment Variables | ✅ | ✅ |
| Branding | ✅ | ✅ |
| Try Panel | ✅ | ✅ |
| Search & Filtering | ✅ | ✅ |
| Dark/Light Mode | ✅ | ✅ |
| Mobile Responsive | ✅ | ✅ |

## 🚀 Future Enhancements

The unified architecture enables exciting future possibilities:

- **Hybrid Mode**: Combine Swagger extraction with manual sections
- **Dynamic Switching**: Runtime mode switching based on configuration
- **Enhanced Integration**: Better tooling and IDE support
- **Advanced Templates**: Mode-specific template customization
- **Plugin System**: Extensible architecture for custom features

## 🎉 Conclusion

The unified architecture represents a significant improvement in the `@kodesonik/zedoc` library:

- **Simplified**: One module for all use cases
- **Powerful**: Full feature parity across modes
- **Flexible**: Choose the approach that fits your needs
- **Future-proof**: Extensible architecture for new features

Whether you prefer the automatic convenience of Swagger mode or the detailed control of structured mode, the unified ZedocModule provides a seamless, powerful solution for all your API documentation needs. 