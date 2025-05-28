# 🌍 Zedoc Environment Variables Configuration Guide

The `@kodesonik/zedoc` library provides a comprehensive environment variables system for managing authentication tokens, headers, query parameters, and other configuration values in the "Try It Out" panel.

## 📋 Environment Configuration Options

### Basic Environment Configuration

```typescript
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'API documentation with environment variables',
      version: '1.0.0',
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
          'X-Platform': 'web',
        },
        queryParams: {
          'version': 'v1',
        }
      }
    }),
  ],
})
export class AppModule {}
```

## 🔑 Environment Variable Types

### Token Variables (type: 'token')
```typescript
{
  name: 'accessToken',
  value: '',
  description: 'JWT access token for API authentication',
  type: 'token',
  sensitive: true,
}
```

**Automatic Header Mapping:**
- `accessToken` → `Authorization: Bearer {value}`
- `bearerToken` → `Authorization: Bearer {value}`
- `apiKey` → `X-API-Key: {value}`
- Other tokens → `X-{name}: {value}`

**Best for:** JWT tokens, API keys, bearer tokens, OAuth tokens

### Header Variables (type: 'header')
```typescript
{
  name: 'userAgent',
  value: 'MyApp/1.0',
  description: 'Custom user agent string',
  type: 'header',
  sensitive: false,
}
```

**Best for:** Custom HTTP headers, client identification, API versioning

### Query Variables (type: 'query')
```typescript
{
  name: 'userId',
  value: '123',
  description: 'Default user ID for testing',
  type: 'query',
  sensitive: false,
}
```

**Best for:** Default query parameters, pagination settings, filter values

### Body Variables (type: 'body')
```typescript
{
  name: 'defaultPayload',
  value: '{"status": "active"}',
  description: 'Default request body template',
  type: 'body',
  sensitive: false,
}
```

**Best for:** Request body templates, default payloads, test data

### Custom Variables (type: 'custom')
```typescript
{
  name: 'baseUrl',
  value: 'https://api.example.com',
  description: 'API base URL',
  type: 'custom',
  sensitive: false,
}
```

**Best for:** Configuration values, URLs, custom settings

## 🛠️ Complete Environment Configuration

### Full Configuration Example
```typescript
environment: {
  variables: [
    // Authentication tokens
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
    
    // Headers
    {
      name: 'userAgent',
      value: 'MyApp/1.0.0',
      description: 'Custom user agent',
      type: 'header',
      sensitive: false,
    },
    
    // Query parameters
    {
      name: 'userId',
      value: '123',
      description: 'Default user ID for testing',
      type: 'query',
      sensitive: false,
    },
    {
      name: 'limit',
      value: '10',
      description: 'Default pagination limit',
      type: 'query',
      sensitive: false,
    },
    
    // Custom variables
    {
      name: 'environment',
      value: 'development',
      description: 'Current environment',
      type: 'custom',
      sensitive: false,
    },
  ],
  
  // Default token values
  defaultTokens: {
    accessToken: process.env.DEFAULT_ACCESS_TOKEN || '',
    refreshToken: process.env.DEFAULT_REFRESH_TOKEN || '',
    apiKey: process.env.DEFAULT_API_KEY || '',
    bearerToken: process.env.DEFAULT_BEARER_TOKEN || '',
  },
  
  // Default headers applied to all requests
  headers: {
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  
  // Default query parameters
  queryParams: {
    'version': 'v1',
    'format': 'json',
  },
}
```

## 🔄 Dynamic Environment Configuration

### Environment-Based Configuration
```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    
    return {
      title: 'My API Documentation',
      environment: {
        variables: [
          {
            name: 'accessToken',
            value: isDevelopment ? configService.get('DEV_ACCESS_TOKEN') : '',
            description: 'JWT access token for API authentication',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'apiKey',
            value: isDevelopment ? configService.get('DEV_API_KEY') : '',
            description: 'API key for service authentication',
            type: 'token',
            sensitive: true,
          },
        ],
        defaultTokens: {
          accessToken: configService.get('DEFAULT_ACCESS_TOKEN'),
          apiKey: configService.get('DEFAULT_API_KEY'),
        },
        headers: {
          'X-Environment': isDevelopment ? 'development' : 'production',
          'X-Client-Version': configService.get('APP_VERSION'),
        },
      }
    };
  },
  inject: [ConfigService],
})
```

### User-Based Configuration
```typescript
ZedocModule.forRootAsync({
  useFactory: async (userService: UserService) => {
    const userPrefs = await userService.getPreferences();
    
    return {
      title: 'Personalized API Documentation',
      environment: {
        variables: [
          {
            name: 'accessToken',
            value: userPrefs.savedAccessToken || '',
            description: 'Your saved access token',
            type: 'token',
            sensitive: true,
          },
          {
            name: 'userId',
            value: userPrefs.defaultUserId || '',
            description: 'Your default user ID',
            type: 'query',
            sensitive: false,
          },
        ],
        headers: {
          'X-User-ID': userPrefs.userId,
          'X-Tenant': userPrefs.tenantId,
        },
      }
    };
  },
  inject: [UserService],
})
```

## 🎯 Use Case Examples

### JWT Authentication Setup
```typescript
environment: {
  variables: [
    {
      name: 'accessToken',
      value: '',
      description: 'JWT access token (expires in 1 hour)',
      type: 'token',
      sensitive: true,
    },
    {
      name: 'refreshToken',
      value: '',
      description: 'JWT refresh token (expires in 30 days)',
      type: 'token',
      sensitive: true,
    },
  ],
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}
```

### API Key Authentication
```typescript
environment: {
  variables: [
    {
      name: 'apiKey',
      value: '',
      description: 'Your API key from the dashboard',
      type: 'token',
      sensitive: true,
    },
  ],
  headers: {
    'X-Client-ID': 'zedoc-docs',
  },
}
```

### Multi-Environment Setup
```typescript
environment: {
  variables: [
    {
      name: 'environment',
      value: 'development',
      description: 'Target environment (development, staging, production)',
      type: 'custom',
      sensitive: false,
    },
    {
      name: 'accessToken',
      value: '',
      description: 'Environment-specific access token',
      type: 'token',
      sensitive: true,
    },
  ],
  headers: {
    'X-Environment': 'development',
  },
}
```

### Testing & Development Setup
```typescript
environment: {
  variables: [
    {
      name: 'testUserId',
      value: 'test-user-123',
      description: 'Test user ID for development',
      type: 'query',
      sensitive: false,
    },
    {
      name: 'debugMode',
      value: 'true',
      description: 'Enable debug mode',
      type: 'query',
      sensitive: false,
    },
    {
      name: 'mockData',
      value: 'true',
      description: 'Use mock data responses',
      type: 'header',
      sensitive: false,
    },
  ],
  headers: {
    'X-Debug': 'true',
    'X-Mock-Data': 'true',
  },
}
```

## 🔧 Environment Variables Features

### Automatic Persistence
- Variables are automatically saved to `localStorage`
- Values persist across browser sessions
- Sensitive variables are handled securely

### Smart Header Mapping
- Token variables automatically map to appropriate headers
- Custom header variables are applied directly
- Environment headers are merged with custom headers

### Try Panel Integration
- Variables appear in the "Try It Out" panel
- Apply/Clear buttons for easy management
- Real-time updates when values change
- Visual indicators for sensitive fields

### Security Features
- Sensitive variables use password input fields
- Values are not logged in console (in production)
- Secure storage in localStorage
- Clear all functionality for security

## 📊 Variable Type Comparison

| Type | Icon | Auto-Header | Persistence | Best For |
|------|------|-------------|-------------|----------|
| **token** | 🔑 | ✅ Authorization | ✅ Secure | JWT, API keys, OAuth |
| **header** | 📋 | ✅ Custom | ✅ Standard | Client info, versioning |
| **query** | 🔍 | ❌ Manual | ✅ Standard | Pagination, filters |
| **body** | 📄 | ❌ Manual | ✅ Standard | Templates, defaults |
| **custom** | ⚙️ | ❌ Manual | ✅ Standard | Config, URLs |

## 🎨 Integration with Themes

Environment variables work seamlessly with all theme presets:

### Dark Mode Environment Panel
```typescript
theme: {
  preset: 'insomnia',
  mode: 'dark',
},
environment: {
  variables: [
    {
      name: 'accessToken',
      value: '',
      description: 'JWT access token',
      type: 'token',
      sensitive: true,
    },
  ],
}
```

### Custom Styled Environment
```typescript
theme: {
  preset: 'custom',
  colors: {
    primary: '#6366f1',
    surface: '#f8fafc',
  },
},
environment: {
  variables: [
    {
      name: 'apiKey',
      value: '',
      description: 'API authentication key',
      type: 'token',
      sensitive: true,
    },
  ],
}
```

## 🚀 JavaScript API

The environment system exposes a global JavaScript API:

### Global Variables
```javascript
// Access environment variables
window.zedocEnvironment = {
  variables: { accessToken: 'jwt-token', userId: '123' },
  headers: { 'Authorization': 'Bearer jwt-token', 'X-User-ID': '123' }
};
```

### Functions
```javascript
// Apply environment variables
applyEnvironmentVariables();

// Clear all variables
clearEnvironmentVariables();

// Save individual variable
saveEnvironmentVariable(event);

// Load saved variables
loadSavedEnvironmentVariables();
```

### Events
```javascript
// Listen for environment changes
document.addEventListener('zedoc:environment:applied', (event) => {
  console.log('Environment variables applied:', event.detail);
});

document.addEventListener('zedoc:environment:cleared', (event) => {
  console.log('Environment variables cleared');
});
```

## 🔧 Advanced Configuration

### Custom Variable Validation
```typescript
environment: {
  variables: [
    {
      name: 'accessToken',
      value: '',
      description: 'JWT access token (must start with "eyJ")',
      type: 'token',
      sensitive: true,
      // Custom validation can be added via JavaScript
    },
  ],
}
```

### Environment-Specific Defaults
```typescript
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  
  const baseConfig = {
    variables: [
      {
        name: 'accessToken',
        value: '',
        description: 'JWT access token',
        type: 'token',
        sensitive: true,
      },
    ],
  };
  
  if (env === 'development') {
    baseConfig.variables.push({
      name: 'debugToken',
      value: 'debug-token-123',
      description: 'Debug token for development',
      type: 'token',
      sensitive: false,
    });
  }
  
  return baseConfig;
};

ZedocModule.forRoot({
  title: 'My API',
  environment: getEnvironmentConfig(),
});
```

## 🔍 Troubleshooting

### Variables Not Persisting
- Check browser localStorage permissions
- Verify variable names are unique
- Ensure JavaScript is enabled

### Headers Not Applied
- Check variable type is set correctly
- Verify token variables follow naming conventions
- Check browser console for errors

### Sensitive Fields Not Hidden
- Ensure `sensitive: true` is set
- Check if password input type is supported
- Verify theme CSS is loaded

### Performance Issues
- Limit number of variables (recommended: < 20)
- Use appropriate variable types
- Clear unused variables regularly

## 📚 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My Awesome API',
      description: 'API documentation with comprehensive environment setup',
      version: '2.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
      },
      sidebar: {
        position: 'left',
        try: {
          enabled: true,
          position: 'auto',
        }
      },
      environment: {
        variables: [
          // Authentication
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
            description: 'API key from dashboard',
            type: 'token',
            sensitive: true,
          },
          
          // Testing
          {
            name: 'userId',
            value: '123',
            description: 'Default user ID for testing',
            type: 'query',
            sensitive: false,
          },
          {
            name: 'limit',
            value: '10',
            description: 'Default pagination limit',
            type: 'query',
            sensitive: false,
          },
        ],
        defaultTokens: {
          accessToken: process.env.DEFAULT_ACCESS_TOKEN || '',
          apiKey: process.env.DEFAULT_API_KEY || '',
        },
        headers: {
          'X-Client-Version': '1.0.0',
          'X-Platform': 'web',
          'Accept': 'application/json',
        },
        queryParams: {
          'version': 'v1',
        },
      }
    }),
  ],
})
export class AppModule {}
```

This configuration provides:
- ✅ JWT and API key authentication
- ✅ Default testing parameters
- ✅ Automatic header management
- ✅ Persistent variable storage
- ✅ Secure sensitive field handling
- ✅ Try panel integration

The environment variables system makes API testing seamless and secure! 🌍🔐 