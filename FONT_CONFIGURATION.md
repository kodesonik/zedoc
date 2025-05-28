# 🔤 Zedoc Font Configuration Guide

The `@kodesonik/zedoc` library provides a comprehensive font system with size presets, font family options, and full customization capabilities for beautiful typography.

## 📋 Font Configuration Options

### Basic Font Configuration

```typescript
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'API documentation with custom typography',
      version: '1.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
        fonts: {
          size: 'md',           // 'sm' | 'md' | 'lg' | 'custom'
          family: 'inter'       // 'inter' | 'roboto' | 'system' | 'custom'
        }
      }
    }),
  ],
})
export class AppModule {}
```

## 📏 Font Size Presets

### Small (sm) - Compact Display
```typescript
fonts: {
  size: 'sm'
}
```

**Size Scale:**
- `xs`: 10px (0.625rem) - Tiny labels, badges
- `sm`: 12px (0.75rem) - Small text, captions
- `base`: 14px (0.875rem) - Body text
- `lg`: 16px (1rem) - Subheadings
- `xl`: 18px (1.125rem) - Section titles
- `2xl`: 20px (1.25rem) - Page subtitles
- `3xl`: 24px (1.5rem) - Main headings
- `4xl`: 32px (2rem) - Large titles
- `5xl`: 40px (2.5rem) - Hero titles

**Best for:** Dense information displays, compact layouts, data tables

### Medium (md) - Balanced (Default)
```typescript
fonts: {
  size: 'md'
}
```

**Size Scale:**
- `xs`: 12px (0.75rem) - Tiny labels, badges
- `sm`: 14px (0.875rem) - Small text, captions
- `base`: 16px (1rem) - Body text
- `lg`: 18px (1.125rem) - Subheadings
- `xl`: 20px (1.25rem) - Section titles
- `2xl`: 24px (1.5rem) - Page subtitles
- `3xl`: 30px (1.875rem) - Main headings
- `4xl`: 36px (2.25rem) - Large titles
- `5xl`: 48px (3rem) - Hero titles

**Best for:** General documentation, balanced readability, most use cases

### Large (lg) - Accessibility Focused
```typescript
fonts: {
  size: 'lg'
}
```

**Size Scale:**
- `xs`: 14px (0.875rem) - Tiny labels, badges
- `sm`: 16px (1rem) - Small text, captions
- `base`: 18px (1.125rem) - Body text
- `lg`: 20px (1.25rem) - Subheadings
- `xl`: 24px (1.5rem) - Section titles
- `2xl`: 30px (1.875rem) - Page subtitles
- `3xl`: 36px (2.25rem) - Main headings
- `4xl`: 48px (3rem) - Large titles
- `5xl`: 60px (3.75rem) - Hero titles

**Best for:** Accessibility compliance, better readability, presentation mode

## 🎨 Font Family Presets

### Inter - Modern UI Font
```typescript
fonts: {
  family: 'inter'
}
```

**Characteristics:**
- Modern, clean sans-serif
- Optimized for user interfaces
- Excellent readability at all sizes
- Wide character support
- Google Fonts integration

**Best for:** Modern applications, clean design, professional documentation

### Roboto - Google's Signature
```typescript
fonts: {
  family: 'roboto'
}
```

**Characteristics:**
- Friendly and approachable
- Google's signature font
- Great for body text
- Mechanical skeleton with friendly curves
- Google Fonts integration

**Best for:** Approachable documentation, Google-style interfaces, friendly tone

### System - Native Fonts
```typescript
fonts: {
  family: 'system'
}
```

**Characteristics:**
- Uses operating system's default fonts
- No external font loading
- Fastest performance
- Native look and feel
- Cross-platform consistency

**Best for:** Performance-critical applications, native feel, minimal dependencies

## 🛠️ Custom Font Configuration

### Custom Font Sizes
```typescript
fonts: {
  size: 'custom',
  customSizes: {
    xs: '0.8rem',
    sm: '0.9rem',
    base: '1.1rem',
    lg: '1.3rem',
    xl: '1.6rem',
    '2xl': '2rem',
    '3xl': '2.5rem',
    '4xl': '3.2rem',
    '5xl': '4rem'
  }
}
```

### Custom Font Family
```typescript
fonts: {
  family: 'custom',
  customFamily: '"Poppins", "Helvetica Neue", Arial, sans-serif'
}
```

### Complete Custom Configuration
```typescript
fonts: {
  size: 'custom',
  family: 'custom',
  customSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
    '5xl': '3.75rem'
  },
  customFamily: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif'
}
```

## 📱 Responsive Typography

The font system automatically scales down on smaller screens:

### Mobile Scaling (≤640px)
- Most sizes scale to 90% of original
- Large titles scale to 85-70% for better fit

### Small Mobile Scaling (≤480px)
- Base sizes scale to 85% of original
- Large titles scale to 65-75% for optimal mobile experience

## 🎯 Font Usage Examples

### Documentation-Focused Setup
```typescript
theme: {
  preset: 'basic',
  fonts: {
    size: 'md',
    family: 'inter'
  }
}
```

### Accessibility-First Setup
```typescript
theme: {
  preset: 'basic',
  fonts: {
    size: 'lg',
    family: 'system'
  }
}
```

### Compact Information Display
```typescript
theme: {
  preset: 'postman',
  fonts: {
    size: 'sm',
    family: 'roboto'
  }
}
```

### Custom Brand Typography
```typescript
theme: {
  preset: 'custom',
  fonts: {
    size: 'custom',
    family: 'custom',
    customSizes: {
      base: '1.125rem',
      lg: '1.375rem',
      xl: '1.75rem',
      '2xl': '2.125rem',
      '3xl': '2.75rem',
      '4xl': '3.5rem',
      '5xl': '4.5rem'
    },
    customFamily: '"Montserrat", "Helvetica Neue", Arial, sans-serif'
  }
}
```

## 🔄 Dynamic Font Configuration

### Environment-Based Fonts
```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    
    return {
      title: 'My API Documentation',
      theme: {
        fonts: {
          size: isProduction ? 'md' : 'lg',  // Larger fonts in development
          family: 'inter'
        }
      }
    };
  },
  inject: [ConfigService],
})
```

### User Preference Based
```typescript
ZedocModule.forRootAsync({
  useFactory: async (userService: UserService) => {
    const userPrefs = await userService.getPreferences();
    
    return {
      title: 'My API Documentation',
      theme: {
        fonts: {
          size: userPrefs.fontSize || 'md',
          family: userPrefs.fontFamily || 'inter'
        }
      }
    };
  },
  inject: [UserService],
})
```

## 🎨 Integration with Themes

Fonts work seamlessly with all theme presets:

### Postman Theme with Large Fonts
```typescript
theme: {
  preset: 'postman',
  mode: 'light',
  fonts: {
    size: 'lg',
    family: 'roboto'
  }
}
```

### Dark Mode with Custom Fonts
```typescript
theme: {
  preset: 'insomnia',
  mode: 'dark',
  fonts: {
    size: 'md',
    family: 'custom',
    customFamily: '"JetBrains Mono", "Fira Code", monospace'
  }
}
```

## 📊 Font Performance Considerations

### Google Fonts Loading
- **Inter**: ~15KB (compressed)
- **Roboto**: ~12KB (compressed)
- **System**: 0KB (no external loading)

### Loading Strategy
```typescript
// Fonts are loaded with display=swap for better performance
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");
```

### Performance Tips
1. Use `system` fonts for fastest loading
2. Preload critical fonts in your HTML head
3. Consider font subsetting for production
4. Use `font-display: swap` for better UX

## 🔧 CSS Variables Generated

The font system generates CSS variables you can use in custom templates:

```css
:root {
  /* Font family */
  --zedoc-font-family: "Inter", sans-serif;
  --zedoc-font-mono: ui-monospace, "SF Mono", Consolas, monospace;
  
  /* Font sizes */
  --zedoc-text-xs: 0.75rem;
  --zedoc-text-sm: 0.875rem;
  --zedoc-text-base: 1rem;
  --zedoc-text-lg: 1.125rem;
  --zedoc-text-xl: 1.25rem;
  --zedoc-text-2xl: 1.5rem;
  --zedoc-text-3xl: 1.875rem;
  --zedoc-text-4xl: 2.25rem;
  --zedoc-text-5xl: 3rem;
  
  /* Font weights */
  --zedoc-font-light: 300;
  --zedoc-font-normal: 400;
  --zedoc-font-medium: 500;
  --zedoc-font-semibold: 600;
  --zedoc-font-bold: 700;
  --zedoc-font-extrabold: 800;
}
```

## 🎯 Typography Classes

Use these classes in custom templates:

```html
<!-- Size classes -->
<h1 class="zedoc-text-5xl">Hero Title</h1>
<h2 class="zedoc-text-3xl">Section Title</h2>
<p class="zedoc-text-base">Body text</p>
<small class="zedoc-text-xs">Caption text</small>

<!-- Weight classes -->
<span class="zedoc-font-light">Light text</span>
<span class="zedoc-font-normal">Normal text</span>
<span class="zedoc-font-medium">Medium text</span>
<span class="zedoc-font-semibold">Semibold text</span>
<span class="zedoc-font-bold">Bold text</span>

<!-- Font family classes -->
<code class="zedoc-font-mono">Code snippet</code>
```

## 🚀 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My Awesome API',
      description: 'Beautiful API documentation with custom typography',
      version: '2.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
        colors: {
          primary: '#ff6c37',
          secondary: '#4a5568'
        },
        fonts: {
          size: 'md',
          family: 'inter'
        }
      },
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true
      }
    }),
  ],
})
export class AppModule {}
```

This configuration provides:
- ✅ Medium-sized, balanced typography
- ✅ Modern Inter font family
- ✅ Automatic responsive scaling
- ✅ Google Fonts integration
- ✅ Theme color integration
- ✅ Sidebar navigation support

## 🔧 Troubleshooting

### Fonts Not Loading
- Check internet connection for Google Fonts
- Verify font family spelling
- Consider using `system` fonts as fallback

### Text Too Small/Large
- Adjust size preset (`sm`, `md`, `lg`)
- Use custom sizes for fine-tuning
- Test on different devices

### Performance Issues
- Use `system` fonts for fastest loading
- Preload fonts in HTML head
- Consider font subsetting

### Custom Fonts Not Working
- Ensure proper font family syntax
- Include fallback fonts
- Test font availability

The font system provides complete typography control while maintaining excellent performance and accessibility! 🎨✨ 