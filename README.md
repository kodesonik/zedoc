# @kodesonik/zedoc

A NestJS library for generating beautiful API documentation with Swagger, Handlebars templates, and Tailwind CSS styling.

## Features

- 🚀 Easy integration with NestJS applications
- 📚 Beautiful HTML documentation generation
- 🎨 Tailwind CSS styling for modern UI
- 🔧 Customizable Handlebars templates
- 📖 Swagger integration
- 🏷️ Custom decorators for enhanced documentation

## Installation

```bash
npm install @kodesonik/zedoc
```

## Quick Start

### 1. Import the module

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'Comprehensive API documentation for my application',
      version: '1.0.0',
    }),
  ],
})
export class AppModule {}
```

### 2. Use the ApiDoc decorator

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiDoc } from '@kodesonik/zedoc';

@Controller('users')
export class UsersController {
  @Get()
  @ApiDoc({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
    tags: ['Users'],
  })
  findAll() {
    return [];
  }
}
```

### 3. Access your documentation

Navigate to `/docs` in your application to view the generated documentation.

## Configuration

### Basic Configuration

```typescript
ZedocModule.forRoot({
  title: 'My API',
  description: 'API documentation',
  version: '1.0.0',
  basePath: '/api',
  tags: ['Users', 'Products'],
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
})
```

### Async Configuration

```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    title: configService.get('API_TITLE'),
    description: configService.get('API_DESCRIPTION'),
    version: configService.get('API_VERSION'),
  }),
  inject: [ConfigService],
})
```

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
}
```

#### ApiDocOptions

```typescript
interface ApiDocOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  operationId?: string;
}
```

### Services

#### DocumentationService

The main service for generating documentation.

```typescript
class DocumentationService {
  setConfig(config: DocumentationConfig): void;
  getConfig(): DocumentationConfig;
  generateDocumentation(endpoints: EndpointInfo[]): string;
}
```

### Decorators

#### @ApiDoc(options: ApiDocOptions)

Decorator for adding documentation metadata to controller methods.

## Custom Templates

You can customize the documentation appearance by providing your own Handlebars templates. Place your custom template at `src/templates/documentation.hbs` in your project.

### Template Variables

- `title`: Documentation title
- `description`: Documentation description
- `version`: API version
- `endpoints`: Array of endpoint information

### Example Custom Template

```handlebars
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <h1>{{title}}</h1>
    {{#each endpoints}}
        <div>
            <span>{{method}}</span>
            <code>{{path}}</code>
            <p>{{description}}</p>
        </div>
    {{/each}}
</body>
</html>
```

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

## Changelog

### 1.0.0
- Initial release
- Basic documentation generation
- Handlebars template support
- Tailwind CSS styling
- Swagger integration 