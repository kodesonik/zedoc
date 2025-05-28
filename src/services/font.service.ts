import { Injectable } from '@nestjs/common';
import { FontConfig, FontSizes } from '../interfaces/documentation.interface';

@Injectable()
export class FontService {
  private readonly fontSizePresets: Record<string, FontSizes> = {
    sm: {
      xs: '0.625rem',    // 10px
      sm: '0.75rem',     // 12px
      base: '0.875rem',  // 14px
      lg: '1rem',        // 16px
      xl: '1.125rem',    // 18px
      '2xl': '1.25rem',  // 20px
      '3xl': '1.5rem',   // 24px
      '4xl': '2rem',     // 32px
      '5xl': '2.5rem',   // 40px
    },
    md: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    lg: {
      xs: '0.875rem',    // 14px
      sm: '1rem',        // 16px
      base: '1.125rem',  // 18px
      lg: '1.25rem',     // 20px
      xl: '1.5rem',      // 24px
      '2xl': '1.875rem', // 30px
      '3xl': '2.25rem',  // 36px
      '4xl': '3rem',     // 48px
      '5xl': '3.75rem',  // 60px
    },
  };

  private readonly fontFamilies: Record<string, string> = {
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    roboto: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  };

  private readonly fontWeights = {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  };

  /**
   * Get resolved font configuration with defaults
   */
  getResolvedFontConfig(fontConfig?: FontConfig): Required<FontConfig> {
    const sizePreset = fontConfig?.size || 'md';
    const familyPreset = fontConfig?.family || 'inter';
    
    return {
      size: sizePreset,
      family: familyPreset,
      customSizes: fontConfig?.customSizes || this.fontSizePresets[sizePreset] || this.fontSizePresets.md,
      customFamily: fontConfig?.customFamily || this.fontFamilies[familyPreset] || this.fontFamilies.inter,
    };
  }

  /**
   * Get font sizes for the current configuration
   */
  getFontSizes(fontConfig?: FontConfig): FontSizes {
    const resolved = this.getResolvedFontConfig(fontConfig);
    
    if (resolved.size === 'custom' && resolved.customSizes) {
      return resolved.customSizes;
    }
    
    return this.fontSizePresets[resolved.size] || this.fontSizePresets.md;
  }

  /**
   * Get font family for the current configuration
   */
  getFontFamily(fontConfig?: FontConfig): string {
    const resolved = this.getResolvedFontConfig(fontConfig);
    
    if (resolved.family === 'custom' && resolved.customFamily) {
      return resolved.customFamily;
    }
    
    return this.fontFamilies[resolved.family] || this.fontFamilies.inter;
  }

  /**
   * Generate font CSS variables and imports
   */
  generateFontCSS(fontConfig?: FontConfig): string {
    const resolved = this.getResolvedFontConfig(fontConfig);
    const sizes = this.getFontSizes(fontConfig);
    const family = this.getFontFamily(fontConfig);

    // Generate Google Fonts import if needed
    let fontImport = '';
    if (resolved.family === 'inter') {
      fontImport = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");';
    } else if (resolved.family === 'roboto') {
      fontImport = '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");';
    }

    // Generate CSS variables for font sizes
    const fontSizeVariables = Object.entries(sizes)
      .map(([key, value]) => `  --zedoc-text-${key}: ${value};`)
      .join('\n');

    // Generate CSS variables for font weights
    const fontWeightVariables = Object.entries(this.fontWeights)
      .map(([key, value]) => `  --zedoc-font-${key}: ${value};`)
      .join('\n');

    return `
      ${fontImport}
      
      :root {
        --zedoc-font-family: ${family};
        --zedoc-font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
      ${fontSizeVariables}
      ${fontWeightVariables}
      }
      
      /* Base font styles */
      body {
        font-family: var(--zedoc-font-family);
        font-size: var(--zedoc-text-base);
        line-height: 1.6;
      }
      
      /* Typography classes */
      .zedoc-text-xs { font-size: var(--zedoc-text-xs); }
      .zedoc-text-sm { font-size: var(--zedoc-text-sm); }
      .zedoc-text-base { font-size: var(--zedoc-text-base); }
      .zedoc-text-lg { font-size: var(--zedoc-text-lg); }
      .zedoc-text-xl { font-size: var(--zedoc-text-xl); }
      .zedoc-text-2xl { font-size: var(--zedoc-text-2xl); }
      .zedoc-text-3xl { font-size: var(--zedoc-text-3xl); }
      .zedoc-text-4xl { font-size: var(--zedoc-text-4xl); }
      .zedoc-text-5xl { font-size: var(--zedoc-text-5xl); }
      
      .zedoc-font-light { font-weight: var(--zedoc-font-light); }
      .zedoc-font-normal { font-weight: var(--zedoc-font-normal); }
      .zedoc-font-medium { font-weight: var(--zedoc-font-medium); }
      .zedoc-font-semibold { font-weight: var(--zedoc-font-semibold); }
      .zedoc-font-bold { font-weight: var(--zedoc-font-bold); }
      .zedoc-font-extrabold { font-weight: var(--zedoc-font-extrabold); }
      
      .zedoc-font-mono { font-family: var(--zedoc-font-mono); }
    `;
  }

  /**
   * Generate responsive font CSS for different screen sizes
   */
  generateResponsiveFontCSS(fontConfig?: FontConfig): string {
    const sizes = this.getFontSizes(fontConfig);
    
    return `
      /* Responsive typography */
      @media (max-width: 640px) {
        :root {
          --zedoc-text-base: ${this.scaleFont(sizes.base || '1rem', 0.9)};
          --zedoc-text-lg: ${this.scaleFont(sizes.lg || '1.125rem', 0.9)};
          --zedoc-text-xl: ${this.scaleFont(sizes.xl || '1.25rem', 0.9)};
          --zedoc-text-2xl: ${this.scaleFont(sizes['2xl'] || '1.5rem', 0.85)};
          --zedoc-text-3xl: ${this.scaleFont(sizes['3xl'] || '1.875rem', 0.8)};
          --zedoc-text-4xl: ${this.scaleFont(sizes['4xl'] || '2.25rem', 0.75)};
          --zedoc-text-5xl: ${this.scaleFont(sizes['5xl'] || '3rem', 0.7)};
        }
      }
      
      @media (max-width: 480px) {
        :root {
          --zedoc-text-base: ${this.scaleFont(sizes.base || '1rem', 0.85)};
          --zedoc-text-lg: ${this.scaleFont(sizes.lg || '1.125rem', 0.85)};
          --zedoc-text-xl: ${this.scaleFont(sizes.xl || '1.25rem', 0.85)};
          --zedoc-text-2xl: ${this.scaleFont(sizes['2xl'] || '1.5rem', 0.8)};
          --zedoc-text-3xl: ${this.scaleFont(sizes['3xl'] || '1.875rem', 0.75)};
          --zedoc-text-4xl: ${this.scaleFont(sizes['4xl'] || '2.25rem', 0.7)};
          --zedoc-text-5xl: ${this.scaleFont(sizes['5xl'] || '3rem', 0.65)};
        }
      }
    `;
  }

  /**
   * Get font classes for different elements
   */
  getFontClasses(fontConfig?: FontConfig): Record<string, string> {
    const resolved = this.getResolvedFontConfig(fontConfig);
    
    // Base classes that work with any font configuration
    return {
      title: 'zedoc-text-5xl zedoc-font-bold',
      subtitle: 'zedoc-text-xl zedoc-font-medium',
      heading1: 'zedoc-text-3xl zedoc-font-bold',
      heading2: 'zedoc-text-2xl zedoc-font-semibold',
      heading3: 'zedoc-text-xl zedoc-font-semibold',
      heading4: 'zedoc-text-lg zedoc-font-medium',
      body: 'zedoc-text-base zedoc-font-normal',
      bodySmall: 'zedoc-text-sm zedoc-font-normal',
      caption: 'zedoc-text-xs zedoc-font-normal',
      code: 'zedoc-text-sm zedoc-font-mono',
      button: 'zedoc-text-sm zedoc-font-medium',
      label: 'zedoc-text-sm zedoc-font-medium',
      badge: 'zedoc-text-xs zedoc-font-semibold',
    };
  }

  /**
   * Scale font size by a factor
   */
  private scaleFont(fontSize: string, factor: number): string {
    const match = fontSize.match(/^(\d*\.?\d+)(rem|px|em)$/);
    if (!match) return fontSize;
    
    const [, value, unit] = match;
    const scaledValue = (parseFloat(value) * factor).toFixed(3);
    return `${scaledValue}${unit}`;
  }

  /**
   * Get available font size presets
   */
  getAvailableSizePresets(): Array<{ key: string; name: string; description: string }> {
    return [
      {
        key: 'sm',
        name: 'Small',
        description: 'Compact text sizes, ideal for dense information display'
      },
      {
        key: 'md',
        name: 'Medium',
        description: 'Balanced text sizes, good for most use cases'
      },
      {
        key: 'lg',
        name: 'Large',
        description: 'Larger text sizes, better for accessibility and readability'
      }
    ];
  }

  /**
   * Get available font family presets
   */
  getAvailableFamilyPresets(): Array<{ key: string; name: string; description: string }> {
    return [
      {
        key: 'inter',
        name: 'Inter',
        description: 'Modern, clean sans-serif font optimized for UI'
      },
      {
        key: 'roboto',
        name: 'Roboto',
        description: 'Google\'s signature font, friendly and approachable'
      },
      {
        key: 'system',
        name: 'System',
        description: 'Uses the operating system\'s default font stack'
      }
    ];
  }
} 