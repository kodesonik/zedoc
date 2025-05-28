# 🧭 Zedoc Sidebar Configuration Guide

The `@kodesonik/zedoc` library provides a comprehensive sidebar system with navigation, search, filtering, and a "Try It Out" panel for interactive API testing.

## 📋 Sidebar Configuration Options

### Basic Sidebar Configuration

```typescript
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My API Documentation',
      description: 'API documentation with sidebar navigation',
      version: '1.0.0',
      sidebar: {
        position: 'left',        // 'left' | 'right' | 'none'
        searchbar: true,         // Enable/disable search functionality
        tagsFilter: true,        // Enable/disable tags filtering
        collapsible: true,       // Allow sidebar to be collapsed
        width: '320px',          // Sidebar width
        try: {
          enabled: true,         // Enable "Try It Out" panel
          position: 'auto',      // 'auto' | 'left' | 'right'
          width: '400px',        // Try panel width
          defaultExpanded: false // Start expanded or collapsed
        }
      }
    }),
  ],
})
export class AppModule {}
```

## 🎯 Sidebar Position Options

### Left Sidebar (Default)
```typescript
sidebar: {
  position: 'left'
}
```
- Sidebar appears on the left side
- Main content is pushed to the right
- Try panel automatically positions on the right

### Right Sidebar
```typescript
sidebar: {
  position: 'right'
}
```
- Sidebar appears on the right side
- Main content is pushed to the left
- Try panel automatically positions on the left

### No Sidebar
```typescript
sidebar: {
  position: 'none'
}
```
- No sidebar is displayed
- Full-width main content
- Try panel can still be enabled independently

## 🔍 Search Configuration

### Enable Search Bar
```typescript
sidebar: {
  searchbar: true  // Default: true
}
```

**Search Features:**
- Real-time search as you type
- Searches through:
  - HTTP methods (GET, POST, etc.)
  - Endpoint paths
  - Endpoint summaries
- Automatically hides non-matching endpoints
- Hides empty tag groups when no matches

### Disable Search Bar
```typescript
sidebar: {
  searchbar: false
}
```

## 🏷️ Tags Filter Configuration

### Enable Tags Filter
```typescript
sidebar: {
  tagsFilter: true  // Default: true
}
```

**Tags Filter Features:**
- Automatically extracts tags from Swagger documentation
- Checkbox-based filtering system
- Multiple tags can be selected simultaneously
- Real-time filtering of endpoint groups
- All tags selected by default

### Disable Tags Filter
```typescript
sidebar: {
  tagsFilter: false
}
```

## 🔧 Try Panel Configuration

### Auto-Positioned Try Panel
```typescript
sidebar: {
  try: {
    enabled: true,
    position: 'auto',  // Automatically positions opposite to sidebar
    width: '400px',
    defaultExpanded: false
  }
}
```

### Manual Try Panel Positioning
```typescript
sidebar: {
  try: {
    enabled: true,
    position: 'right',  // Force position regardless of sidebar
    width: '450px',
    defaultExpanded: true
  }
}
```

### Disable Try Panel
```typescript
sidebar: {
  try: {
    enabled: false
  }
}
```

## 📐 Layout Examples

### Classic Left Sidebar + Right Try Panel
```typescript
sidebar: {
  position: 'left',
  width: '320px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: true,
    position: 'auto',  // Will be 'right'
    width: '400px',
    defaultExpanded: false
  }
}
```

### Right Sidebar + Left Try Panel
```typescript
sidebar: {
  position: 'right',
  width: '350px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: true,
    position: 'auto',  // Will be 'left'
    width: '450px',
    defaultExpanded: false
  }
}
```

### No Sidebar + Right Try Panel
```typescript
sidebar: {
  position: 'none',
  try: {
    enabled: true,
    position: 'right',
    width: '400px',
    defaultExpanded: true
  }
}
```

### Full-Width (No Sidebar, No Try Panel)
```typescript
sidebar: {
  position: 'none',
  try: {
    enabled: false
  }
}
```

## 🎨 Responsive Design

### Mobile Behavior
- Sidebars automatically collapse on mobile devices (≤768px)
- Sidebar width adjusts to 280px on mobile
- Main content uses full width on mobile
- Clicking an endpoint link auto-hides sidebar on mobile

### Tablet Behavior
- Sidebars maintain their configured width
- Try panels may auto-collapse for better content visibility
- Touch-friendly interaction elements

## ⚙️ Advanced Configuration

### Custom Widths
```typescript
sidebar: {
  position: 'left',
  width: '400px',      // Wide sidebar for more content
  try: {
    enabled: true,
    width: '500px'     // Wide try panel for complex forms
  }
}
```

### Minimal Configuration
```typescript
sidebar: {
  position: 'left',
  searchbar: false,    // No search
  tagsFilter: false,   // No filtering
  collapsible: false,  // Always visible
  width: '250px',      // Narrow sidebar
  try: {
    enabled: false     // No try panel
  }
}
```

### Developer-Friendly Setup
```typescript
sidebar: {
  position: 'left',
  width: '350px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: true,
    position: 'right',
    width: '450px',
    defaultExpanded: true  // Start with try panel open
  }
}
```

## 🔄 Dynamic Configuration

### Environment-Based Configuration
```typescript
ZedocModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    
    return {
      title: 'My API Documentation',
      sidebar: {
        position: 'left',
        searchbar: true,
        tagsFilter: true,
        collapsible: !isDevelopment,  // Always visible in dev
        try: {
          enabled: isDevelopment,     // Only in development
          defaultExpanded: isDevelopment
        }
      }
    };
  },
  inject: [ConfigService],
})
```

## 🎯 Best Practices

### For API Documentation
```typescript
sidebar: {
  position: 'left',
  width: '320px',
  searchbar: true,      // Essential for large APIs
  tagsFilter: true,     // Group endpoints logically
  collapsible: true,    // User preference
  try: {
    enabled: false      // Focus on documentation
  }
}
```

### For Interactive Testing
```typescript
sidebar: {
  position: 'left',
  width: '300px',
  searchbar: true,
  tagsFilter: true,
  collapsible: true,
  try: {
    enabled: true,
    position: 'right',
    width: '450px',     // More space for forms
    defaultExpanded: false
  }
}
```

### For Mobile-First
```typescript
sidebar: {
  position: 'left',
  width: '280px',       // Mobile-optimized width
  searchbar: true,      // Essential for navigation
  tagsFilter: false,    // Simplify mobile experience
  collapsible: true,    // Must-have for mobile
  try: {
    enabled: false      // Avoid clutter on mobile
  }
}
```

## 🎨 Integration with Themes

The sidebar system automatically adapts to your chosen theme:

```typescript
ZedocModule.forRoot({
  theme: {
    preset: 'postman',
    mode: 'dark'
  },
  sidebar: {
    position: 'left',
    // Sidebar will use dark theme colors automatically
  }
})
```

## 🚀 Complete Example

```typescript
import { Module } from '@nestjs/common';
import { ZedocModule } from '@kodesonik/zedoc';

@Module({
  imports: [
    ZedocModule.forRoot({
      title: 'My Awesome API',
      description: 'Complete API documentation with sidebar navigation',
      version: '2.0.0',
      theme: {
        preset: 'postman',
        mode: 'light'
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
      }
    }),
  ],
})
export class AppModule {}
```

This configuration provides:
- ✅ Left sidebar with navigation
- ✅ Search functionality
- ✅ Tags filtering
- ✅ Collapsible sidebar
- ✅ Right-positioned try panel
- ✅ Postman theme integration
- ✅ Mobile-responsive design

## 🔧 Troubleshooting

### Sidebar Not Appearing
- Check that `position` is not set to `'none'`
- Verify the module is properly imported
- Ensure Swagger document is set

### Try Panel Not Working
- Confirm `try.enabled` is `true`
- Check that endpoints have proper Swagger documentation
- Verify panel width doesn't exceed viewport

### Search Not Working
- Ensure `searchbar` is `true`
- Check that endpoints have searchable content (paths, summaries)
- Verify JavaScript is enabled

### Mobile Issues
- Sidebar should auto-collapse on mobile
- Check viewport meta tag is present
- Verify touch interactions work properly

The sidebar system provides a complete navigation solution that enhances the user experience while maintaining full compatibility with all theme options! 🎨✨ 