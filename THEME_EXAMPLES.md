# 🎨 Zedoc Theme Configuration Guide

The `@kodesonik/zedoc` library provides comprehensive theming capabilities with predefined themes and full customization options.

## 📋 Theme Configuration Options

### Basic Configuration

```typescript
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'API documentation with custom theme',
      version: '1.0.0',
      theme: {
        preset: 'basic',        // 'basic' | 'postman' | 'insomnia' | 'swagger' | 'custom'
        mode: 'light',          // 'light' | 'dark'
        colors: {
          // Custom color overrides
          primary: '#3b82f6',
          secondary: '#64748b',
          // ... more colors
        }
      }
    }),
  ],
})
export class AppModule {}
```

## 🎯 Predefined Themes

### 1. Basic Theme (Default)
```typescript
theme: {
  preset: 'basic',
  mode: 'light'
}
```
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

### 2. Postman Theme
```typescript
theme: {
  preset: 'postman',
  mode: 'light'
}
```
- **Primary**: Orange (#ff6c37)
- **Clean, professional look**
- **Inspired by Postman's UI**

### 3. Insomnia Theme
```typescript
theme: {
  preset: 'insomnia',
  mode: 'light'
}
```
- **Primary**: Purple (#7c3aed)
- **Tertiary**: Pink (#ec4899)
- **Modern, vibrant design**

### 4. Swagger Theme
```typescript
theme: {
  preset: 'swagger',
  mode: 'light'
}
```
- **Primary**: Green (#85ea2d)
- **Tertiary**: Blue (#61affe)
- **Classic Swagger colors**

## 🌙 Dark Mode

All themes support dark mode:

```typescript
theme: {
  preset: 'postman',
  mode: 'dark'  // Automatically applies dark mode overrides
}
```

Dark mode automatically adjusts:
- Background colors
- Text colors
- Border colors
- Surface colors

## 🎨 Custom Colors

### Full Color Customization

```typescript
theme: {
  preset: 'custom',  // or any preset as base
  mode: 'light',
  colors: {
    // Brand colors
    primary: '#ff6c37',      // Main brand color
    secondary: '#4a5568',    // Secondary brand color
    tertiary: '#8b5cf6',     // Accent color
    
    // Status colors
    success: '#48bb78',      // Success states
    warning: '#ed8936',      // Warning states
    danger: '#f56565',       // Error states
    neutral: '#6b7280',      // Neutral elements
    
    // Theme colors
    light: '#f8fafc',        // Light theme elements
    dark: '#1e293b',         // Dark theme elements
    
    // Layout colors
    background: '#ffffff',   // Page background
    surface: '#f8fafc',      // Card/surface background
    text: '#1e293b',         // Primary text
    textSecondary: '#64748b', // Secondary text
    border: '#e2e8f0',       // Border color
  }
}
```

### Partial Color Overrides

You can override specific colors while keeping the preset base:

```typescript
theme: {
  preset: 'swagger',
  mode: 'light',
  colors: {
    primary: '#ff0000',      // Override just the primary color
    success: '#00ff00',      // Override just the success color
  }
}
```

## 🔧 Advanced Configuration Examples

### Corporate Theme
```typescript
theme: {
  preset: 'custom',
  mode: 'light',
  colors: {
    primary: '#1e40af',      // Corporate blue
    secondary: '#374151',    // Professional gray
    success: '#059669',      // Professional green
    warning: '#d97706',      // Professional amber
    danger: '#dc2626',       // Professional red
    background: '#f9fafb',   // Light gray background
    surface: '#ffffff',      // White cards
    text: '#111827',         // Dark text
    textSecondary: '#6b7280', // Gray text
    border: '#d1d5db',       // Light borders
  }
}
```

### Dark Corporate Theme
```typescript
theme: {
  preset: 'custom',
  mode: 'dark',
  colors: {
    primary: '#3b82f6',      // Bright blue for dark mode
    secondary: '#9ca3af',    // Light gray
    success: '#10b981',      // Bright green
    warning: '#f59e0b',      // Bright amber
    danger: '#ef4444',       // Bright red
    background: '#111827',   // Very dark background
    surface: '#1f2937',      // Dark cards
    text: '#f9fafb',         // Light text
    textSecondary: '#d1d5db', // Light gray text
    border: '#374151',       // Dark borders
  }
}
```

### Vibrant Theme
```typescript
theme: {
  preset: 'custom',
  mode: 'light',
  colors: {
    primary: '#8b5cf6',      // Purple
    secondary: '#06b6d4',    // Cyan
    tertiary: '#f59e0b',     // Amber
    success: '#10b981',      // Emerald
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Red
    background: '#fefefe',   // Pure white
    surface: '#f8fafc',      // Very light gray
    text: '#1e293b',         // Dark slate
    textSecondary: '#475569', // Medium slate
    border: '#e2e8f0',       // Light slate
  }
}
```

## 🚀 Async Configuration

For dynamic theme configuration:

```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const themeMode = await configService.get('THEME_MODE');
    const brandColor = await configService.get('BRAND_COLOR');
    
    return {
      title: 'Dynamic API Documentation',
      theme: {
        preset: 'custom',
        mode: themeMode || 'light',
        colors: {
          primary: brandColor || '#3b82f6',
          // ... other colors
        }
      }
    };
  },
  inject: [ConfigService],
})
```

## 🎯 HTTP Method Colors

The theme system automatically generates appropriate colors for HTTP methods:

- **GET**: Success color (green variants)
- **POST**: Primary color (blue variants)
- **PUT**: Warning color (amber variants)
- **DELETE**: Danger color (red variants)
- **PATCH**: Tertiary color (purple variants)
- **OPTIONS**: Neutral color (gray variants)
- **HEAD**: Secondary color (slate variants)

## 📱 Responsive Design

All themes are fully responsive and work across:
- Desktop computers
- Tablets
- Mobile devices
- Different screen orientations

## 🔍 CSS Variables

The theme system generates CSS custom properties that you can use in custom templates:

```css
:root {
  --zedoc-primary: #ff6c37;
  --zedoc-secondary: #4a5568;
  --zedoc-success: #48bb78;
  --zedoc-warning: #ed8936;
  --zedoc-danger: #f56565;
  --zedoc-background: #ffffff;
  --zedoc-surface: #f8fafc;
  --zedoc-text: #1a1a1a;
  --zedoc-text-secondary: #6b7280;
  --zedoc-border: #e5e5e5;
}
```

## 🛠️ Custom Templates

When creating custom Handlebars templates, use theme helpers:

```handlebars
<div class="{{themeClass 'card'}}">
  <h1 class="{{themeClass 'header'}}">{{title}}</h1>
  <p class="{{themeClass 'textSecondary'}}">{{description}}</p>
</div>

<style>
  {{{themeCSS}}}
  {{{methodColors}}}
</style>
```

## 📚 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My Awesome API',
      description: 'A beautifully themed API documentation',
      version: '2.0.0',
      theme: {
        preset: 'postman',
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
          border: '#e5e5e5',
        }
      }
    }),
  ],
})
export class AppModule {}
```

This will create a beautiful, professional-looking documentation site with the Postman-inspired theme and your custom color overrides! 🎨✨ 