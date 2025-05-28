# 🎨 Zedoc Branding Configuration Guide

The `@kodesonik/zedoc` library provides comprehensive branding options to customize the visual identity of your API documentation with favicon, logo, and cover image support.

## 📋 Branding Configuration Options

### Basic Branding Configuration

```typescript
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'Branded API documentation',
      version: '1.0.0',
      branding: {
        favicon: '/favicon.ico',
        logo: {
          src: '/logo.svg',
          alt: 'Company Logo',
          height: '40px',
          position: 'header',
          link: 'https://company.com'
        },
        cover: {
          src: '/hero-image.jpg',
          alt: 'API Documentation',
          position: 'top',
          height: '300px',
          opacity: 0.9
        }
      }
    }),
  ],
})
export class AppModule {}
```

## 🔖 Favicon Configuration

### Basic Favicon Setup
```typescript
branding: {
  favicon: '/favicon.ico'
}
```

### Supported Favicon Formats
```typescript
// ICO format (classic)
favicon: '/favicon.ico'

// PNG format (modern)
favicon: '/favicon.png'

// SVG format (scalable)
favicon: '/favicon.svg'

// External URL
favicon: 'https://cdn.example.com/favicon.svg'
```

### Generated HTML
The favicon configuration automatically generates:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/favicon.svg">
```

## 🏷️ Logo Configuration

### Logo Positions

#### Header Logo
```typescript
logo: {
  src: '/logo.svg',
  alt: 'Company Logo',
  height: '40px',
  position: 'header',
  link: 'https://company.com'
}
```

#### Sidebar Logo
```typescript
logo: {
  src: '/logo-white.svg',
  alt: 'Company Logo',
  height: '35px',
  position: 'sidebar',
  link: '/'
}
```

#### Both Header and Sidebar
```typescript
logo: {
  src: '/logo.svg',
  alt: 'Company Logo',
  height: '40px',
  position: 'both',
  link: 'https://company.com'
}
```

### Logo Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | `string` | - | Logo image URL (required) |
| `alt` | `string` | `'Logo'` | Alt text for accessibility |
| `width` | `string` | `'auto'` | Logo width (CSS value) |
| `height` | `string` | `'40px'` | Logo height (CSS value) |
| `position` | `'header' \| 'sidebar' \| 'both'` | `'header'` | Where to display the logo |
| `link` | `string` | - | Optional link URL |

### Logo Examples

#### Simple Header Logo
```typescript
logo: {
  src: '/company-logo.png',
  alt: 'Company Name',
  height: '45px',
  position: 'header'
}
```

#### Linked Sidebar Logo
```typescript
logo: {
  src: '/logo-sidebar.svg',
  alt: 'Brand',
  height: '35px',
  width: '120px',
  position: 'sidebar',
  link: 'https://brand.com'
}
```

#### Responsive Logo (Both Positions)
```typescript
logo: {
  src: '/logo-responsive.svg',
  alt: 'API Brand',
  height: '40px',
  position: 'both',
  link: '/'
}
```

## 🖼️ Cover Image Configuration

### Cover Positions

#### Top Banner
```typescript
cover: {
  src: '/api-banner.jpg',
  alt: 'API Documentation',
  position: 'top',
  height: '300px',
  opacity: 0.9
}
```

#### Hero Section with Overlay
```typescript
cover: {
  src: '/hero-background.jpg',
  alt: 'API Hero',
  position: 'hero',
  height: '400px',
  overlay: true,
  overlayColor: 'rgba(59, 130, 246, 0.7)'
}
```

#### Background Image
```typescript
cover: {
  src: '/subtle-pattern.svg',
  position: 'background',
  opacity: 0.1
}
```

### Cover Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | `string` | - | Cover image URL (required) |
| `alt` | `string` | `'Cover image'` | Alt text for accessibility |
| `position` | `'top' \| 'hero' \| 'background'` | `'top'` | Cover display style |
| `height` | `string` | `'300px'` | Cover height (CSS value) |
| `opacity` | `number` | `1` | Image opacity (0-1) |
| `overlay` | `boolean` | `false` | Add color overlay |
| `overlayColor` | `string` | `'rgba(0, 0, 0, 0.4)'` | Overlay color |

### Cover Position Examples

#### Top Banner Style
```typescript
cover: {
  src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
  alt: 'Technology Background',
  position: 'top',
  height: '250px',
  opacity: 0.95
}
```

#### Hero Section with Content
```typescript
cover: {
  src: '/api-hero-image.jpg',
  alt: 'API Documentation Hero',
  position: 'hero',
  height: '500px',
  overlay: true,
  overlayColor: 'rgba(16, 185, 129, 0.6)' // Green overlay
}
```

#### Subtle Background Pattern
```typescript
cover: {
  src: '/geometric-pattern.svg',
  position: 'background',
  opacity: 0.05
}
```

## 🎨 Complete Branding Examples

### Corporate Branding
```typescript
branding: {
  favicon: '/corporate-favicon.ico',
  logo: {
    src: '/corporate-logo.svg',
    alt: 'Corporate Inc.',
    height: '50px',
    width: '200px',
    position: 'header',
    link: 'https://corporate.com'
  },
  cover: {
    src: '/corporate-banner.jpg',
    alt: 'Corporate API',
    position: 'top',
    height: '200px',
    opacity: 0.9
  }
}
```

### Startup Branding
```typescript
branding: {
  favicon: '/startup-icon.svg',
  logo: {
    src: '/startup-logo.svg',
    alt: 'Startup Name',
    height: '40px',
    position: 'both',
    link: '/'
  },
  cover: {
    src: '/startup-hero.jpg',
    alt: 'Innovation',
    position: 'hero',
    height: '400px',
    overlay: true,
    overlayColor: 'rgba(99, 102, 241, 0.8)'
  }
}
```

### Developer-Focused Branding
```typescript
branding: {
  favicon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  logo: {
    src: '/dev-logo.png',
    alt: 'Developer API',
    height: '35px',
    position: 'sidebar'
  },
  cover: {
    src: '/code-background.jpg',
    alt: 'Code Background',
    position: 'background',
    opacity: 0.1
  }
}
```

### Minimalist Branding
```typescript
branding: {
  favicon: '/minimal-icon.svg',
  logo: {
    src: '/minimal-logo.svg',
    alt: 'Brand',
    height: '30px',
    position: 'header'
  }
  // No cover image for clean look
}
```

## 🔄 Dynamic Branding Configuration

### Environment-Based Branding
```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const environment = configService.get('NODE_ENV');
    const isDevelopment = environment === 'development';
    
    return {
      title: 'My API Documentation',
      branding: {
        favicon: isDevelopment ? '/dev-favicon.svg' : '/prod-favicon.ico',
        logo: {
          src: isDevelopment ? '/dev-logo.svg' : '/prod-logo.svg',
          alt: 'API Logo',
          height: '40px',
          position: 'both',
          link: configService.get('BRAND_URL')
        },
        cover: isDevelopment ? {
          src: '/dev-banner.jpg',
          alt: 'Development Environment',
          position: 'top',
          height: '200px',
          overlay: true,
          overlayColor: 'rgba(245, 101, 101, 0.7)' // Red for dev
        } : {
          src: '/prod-banner.jpg',
          alt: 'Production API',
          position: 'top',
          height: '300px',
          opacity: 0.95
        }
      }
    };
  },
  inject: [ConfigService],
})
```

### Theme-Aware Branding
```typescript
ZedocModule.forRootAsync({
  useFactory: async (themeService: ThemeService) => {
    const isDarkMode = themeService.isDarkMode();
    
    return {
      title: 'Theme-Aware API',
      branding: {
        favicon: '/adaptive-favicon.svg',
        logo: {
          src: isDarkMode ? '/logo-dark.svg' : '/logo-light.svg',
          alt: 'Adaptive Logo',
          height: '40px',
          position: 'both'
        },
        cover: {
          src: isDarkMode ? '/dark-hero.jpg' : '/light-hero.jpg',
          alt: 'Themed Background',
          position: 'hero',
          height: '350px',
          overlay: true,
          overlayColor: isDarkMode 
            ? 'rgba(17, 24, 39, 0.8)' 
            : 'rgba(249, 250, 251, 0.8)'
        }
      }
    };
  },
  inject: [ThemeService],
})
```

## 📱 Responsive Branding

### Mobile-Optimized Configuration
```typescript
branding: {
  favicon: '/favicon.svg',
  logo: {
    src: '/logo-responsive.svg',
    alt: 'Mobile-Friendly Logo',
    height: '40px', // Automatically scales to 32px on mobile
    position: 'header'
  },
  cover: {
    src: '/responsive-hero.jpg',
    alt: 'Responsive Cover',
    position: 'top',
    height: '300px', // Automatically scales to 200px on mobile
    opacity: 0.9
  }
}
```

### Responsive CSS (Automatically Applied)
```css
@media (max-width: 768px) {
  .logo-image {
    height: 32px !important;
  }
  
  .sidebar-logo-image {
    max-width: 70%;
  }
  
  .cover-top, .cover-hero {
    height: 200px !important;
  }
}

@media (max-width: 480px) {
  .cover-top, .cover-hero {
    height: 150px !important;
  }
}
```

## 🎯 Integration with Themes

### Theme-Specific Branding
```typescript
// Postman theme with orange branding
theme: { preset: 'postman', mode: 'light' },
branding: {
  favicon: '/postman-style-favicon.svg',
  logo: {
    src: '/orange-logo.svg',
    alt: 'Postman-Style API',
    height: '40px',
    position: 'header'
  },
  cover: {
    src: '/orange-gradient.jpg',
    position: 'hero',
    height: '300px',
    overlay: true,
    overlayColor: 'rgba(255, 108, 55, 0.7)'
  }
}
```

### Dark Mode Branding
```typescript
theme: { preset: 'insomnia', mode: 'dark' },
branding: {
  favicon: '/dark-favicon.svg',
  logo: {
    src: '/logo-white.svg', // White logo for dark theme
    alt: 'Dark Mode Logo',
    height: '40px',
    position: 'both'
  },
  cover: {
    src: '/dark-hero.jpg',
    position: 'background',
    opacity: 0.2
  }
}
```

## 🔧 Advanced Branding Features

### CDN and External Assets
```typescript
branding: {
  // Use CDN for favicon
  favicon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg',
  
  // External logo from CDN
  logo: {
    src: 'https://nestjs.com/img/logo-small.svg',
    alt: 'NestJS',
    height: '45px',
    position: 'both',
    link: 'https://nestjs.com'
  },
  
  // Unsplash cover image
  cover: {
    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80',
    alt: 'Technology',
    position: 'top',
    height: '250px',
    opacity: 0.9
  }
}
```

### Base64 Embedded Assets
```typescript
branding: {
  // Small favicon as base64
  favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiI+PC9zdmc+',
  
  // Small logo as base64
  logo: {
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIj48L3N2Zz4=',
    alt: 'Embedded Logo',
    height: '40px',
    position: 'header'
  }
}
```

## 🎨 Branding Best Practices

### Logo Guidelines
- **Size**: Keep logos between 30-50px height for optimal display
- **Format**: Use SVG for scalability, PNG for complex images
- **Contrast**: Ensure logos work with your chosen theme colors
- **Link**: Add meaningful links to enhance navigation

### Cover Image Guidelines
- **Resolution**: Use high-resolution images (1200px+ width)
- **Aspect Ratio**: 4:1 or 3:1 ratios work best for banners
- **File Size**: Optimize images to keep page load times fast
- **Accessibility**: Always provide meaningful alt text

### Favicon Guidelines
- **Format**: SVG preferred for modern browsers, ICO for compatibility
- **Size**: 32x32px minimum, scalable SVG recommended
- **Simplicity**: Keep favicon designs simple and recognizable

## 🔍 Troubleshooting

### Logo Not Displaying
- Check image URL accessibility
- Verify image format is supported
- Ensure proper alt text is provided
- Check browser console for loading errors

### Cover Image Issues
- Verify image URL is accessible
- Check image dimensions and file size
- Ensure proper CSS positioning
- Test on different screen sizes

### Favicon Not Loading
- Clear browser cache
- Check favicon URL and format
- Verify MIME type is correct
- Test in different browsers

## 📚 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'Comprehensive Branded API',
      description: 'Full-featured API documentation with complete branding',
      version: '2.0.0',
      theme: {
        preset: 'postman',
        mode: 'light',
        colors: {
          primary: '#ff6c37'
        }
      },
      sidebar: {
        position: 'left',
        try: { enabled: true }
      },
      branding: {
        // Modern SVG favicon
        favicon: '/api-favicon.svg',
        
        // Responsive logo in both positions
        logo: {
          src: '/api-logo.svg',
          alt: 'API Documentation',
          height: '45px',
          position: 'both',
          link: 'https://api.company.com'
        },
        
        // Hero cover with overlay
        cover: {
          src: '/api-hero-background.jpg',
          alt: 'API Documentation Hero',
          position: 'hero',
          height: '400px',
          overlay: true,
          overlayColor: 'rgba(255, 108, 55, 0.7)'
        }
      }
    }),
  ],
})
export class AppModule {}
```

This configuration provides:
- ✅ Modern SVG favicon for all devices
- ✅ Responsive logo in header and sidebar
- ✅ Hero cover image with branded overlay
- ✅ Consistent branding across all elements
- ✅ Accessibility-compliant alt texts
- ✅ Mobile-responsive design

The branding system seamlessly integrates with all other Zedoc features! 🎨✨ 