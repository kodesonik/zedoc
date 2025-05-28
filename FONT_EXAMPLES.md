# 🔤 Font Configuration Examples

Quick examples showing different font configurations for the `@kodesonik/zedoc` library.

## 📏 Size Preset Examples

### Small - Compact Layout
```typescript
ZedocModule.forRoot({
  title: 'Compact API Docs',
  theme: {
    preset: 'basic',
    fonts: {
      size: 'sm',
      family: 'system'
    }
  }
})
```
**Perfect for:** Dense data displays, compact dashboards, technical documentation

### Medium - Balanced (Default)
```typescript
ZedocModule.forRoot({
  title: 'Standard API Docs',
  theme: {
    preset: 'postman',
    fonts: {
      size: 'md',
      family: 'inter'
    }
  }
})
```
**Perfect for:** General documentation, most use cases, balanced readability

### Large - Accessibility
```typescript
ZedocModule.forRoot({
  title: 'Accessible API Docs',
  theme: {
    preset: 'swagger',
    fonts: {
      size: 'lg',
      family: 'roboto'
    }
  }
})
```
**Perfect for:** Accessibility compliance, presentations, better readability

## 🎨 Font Family Examples

### Inter - Modern & Clean
```typescript
theme: {
  fonts: {
    size: 'md',
    family: 'inter'  // Modern UI font
  }
}
```

### Roboto - Friendly & Approachable
```typescript
theme: {
  fonts: {
    size: 'md',
    family: 'roboto'  // Google's signature font
  }
}
```

### System - Native & Fast
```typescript
theme: {
  fonts: {
    size: 'md',
    family: 'system'  // OS native fonts
  }
}
```

## 🛠️ Custom Font Examples

### Custom Sizes
```typescript
theme: {
  fonts: {
    size: 'custom',
    family: 'inter',
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
}
```

### Custom Font Family
```typescript
theme: {
  fonts: {
    size: 'md',
    family: 'custom',
    customFamily: '"Poppins", "Helvetica Neue", Arial, sans-serif'
  }
}
```

### Complete Custom Setup
```typescript
theme: {
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
    customFamily: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif'
  }
}
```

## 🎯 Use Case Examples

### Corporate Documentation
```typescript
ZedocModule.forRoot({
  title: 'Enterprise API',
  theme: {
    preset: 'basic',
    mode: 'light',
    fonts: {
      size: 'md',
      family: 'system'  // Professional, native look
    },
    colors: {
      primary: '#1e40af',
      secondary: '#374151'
    }
  }
})
```

### Developer-Friendly
```typescript
ZedocModule.forRoot({
  title: 'Developer API',
  theme: {
    preset: 'postman',
    mode: 'dark',
    fonts: {
      size: 'lg',
      family: 'inter'  // Modern, readable
    }
  }
})
```

### Mobile-Optimized
```typescript
ZedocModule.forRoot({
  title: 'Mobile API',
  theme: {
    preset: 'basic',
    fonts: {
      size: 'sm',       // Compact for mobile
      family: 'system'  // Fast loading
    }
  },
  sidebar: {
    position: 'none'    // Full-width on mobile
  }
})
```

### Presentation Mode
```typescript
ZedocModule.forRoot({
  title: 'API Presentation',
  theme: {
    preset: 'swagger',
    fonts: {
      size: 'lg',       // Large for visibility
      family: 'roboto'  // Friendly presentation font
    }
  }
})
```

## 🔄 Dynamic Font Configuration

### Environment-Based
```typescript
ZedocModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    title: 'Dynamic API Docs',
    theme: {
      fonts: {
        size: configService.get('NODE_ENV') === 'development' ? 'lg' : 'md',
        family: 'inter'
      }
    }
  }),
  inject: [ConfigService]
})
```

### User Preference Based
```typescript
ZedocModule.forRootAsync({
  useFactory: async (userService: UserService) => {
    const prefs = await userService.getPreferences();
    return {
      title: 'Personalized API Docs',
      theme: {
        fonts: {
          size: prefs.fontSize || 'md',
          family: prefs.fontFamily || 'inter'
        }
      }
    };
  },
  inject: [UserService]
})
```

## 📊 Font Size Comparison

| Preset | Body Text | Headings | Best For |
|--------|-----------|----------|----------|
| **sm** | 14px | 24px-40px | Dense layouts, data tables |
| **md** | 16px | 30px-48px | General documentation |
| **lg** | 18px | 36px-60px | Accessibility, presentations |

## 🎨 Font Family Characteristics

| Family | Style | Loading | Best For |
|--------|-------|---------|----------|
| **Inter** | Modern, clean | Google Fonts | UI-focused docs |
| **Roboto** | Friendly, approachable | Google Fonts | User-friendly docs |
| **System** | Native OS fonts | No loading | Performance-critical |

Choose the combination that best fits your documentation needs! 🚀 