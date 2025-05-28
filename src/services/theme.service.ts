import { Injectable } from '@nestjs/common';
import { ThemeConfig, ThemeColors } from '../interfaces/documentation.interface';

@Injectable()
export class ThemeService {
  private readonly presetThemes: Record<string, ThemeColors> = {
    basic: {
      primary: '#3b82f6',
      secondary: '#64748b',
      tertiary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      neutral: '#6b7280',
      light: '#f8fafc',
      dark: '#1e293b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
    postman: {
      primary: '#ff6c37',
      secondary: '#6b7280',
      tertiary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      neutral: '#6b7280',
      light: '#f8fafc',
      dark: '#1a1a1a',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1a1a1a',
      textSecondary: '#6b7280',
      border: '#e5e5e5',
    },
    insomnia: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      tertiary: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      neutral: '#6b7280',
      light: '#f8fafc',
      dark: '#2d1b69',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#6b7280',
      border: '#e2e8f0',
    },
    swagger: {
      primary: '#85ea2d',
      secondary: '#6b7280',
      tertiary: '#61affe',
      success: '#49cc90',
      warning: '#fca130',
      danger: '#f93e3e',
      neutral: '#6b7280',
      light: '#f8fafc',
      dark: '#1e293b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#3b4151',
      textSecondary: '#6b7280',
      border: '#e2e8f0',
    },
  };

  private readonly darkModeOverrides: Partial<ThemeColors> = {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    light: '#1e293b',
    dark: '#0f172a',
  };

  /**
   * Get the complete theme configuration with resolved colors
   */
  getResolvedTheme(themeConfig?: ThemeConfig): ThemeColors {
    const preset = themeConfig?.preset || 'basic';
    const mode = themeConfig?.mode || 'light';
    
    // Start with preset theme
    let colors: ThemeColors = { ...this.presetThemes[preset] || this.presetThemes.basic };
    
    // Apply dark mode overrides if needed
    if (mode === 'dark') {
      colors = { ...colors, ...this.darkModeOverrides };
    }
    
    // Apply custom color overrides
    if (themeConfig?.colors) {
      colors = { ...colors, ...themeConfig.colors };
    }
    
    return colors;
  }

  /**
   * Generate CSS custom properties for the theme
   */
  generateThemeCSS(themeConfig?: ThemeConfig): string {
    const colors = this.getResolvedTheme(themeConfig);
    
    const cssVariables = Object.entries(colors)
      .map(([key, value]) => `  --zedoc-${this.kebabCase(key)}: ${value};`)
      .join('\n');
    
    return `:root {\n${cssVariables}\n}`;
  }

  /**
   * Generate method-specific color classes
   */
  generateMethodColors(themeConfig?: ThemeConfig): string {
    const colors = this.getResolvedTheme(themeConfig);
    
    return `
      .method-get { 
        background-color: ${this.lighten(colors.success || '#10b981', 0.9)}; 
        color: ${this.darken(colors.success || '#10b981', 0.2)}; 
      }
      .method-post { 
        background-color: ${this.lighten(colors.primary || '#3b82f6', 0.9)}; 
        color: ${this.darken(colors.primary || '#3b82f6', 0.2)}; 
      }
      .method-put { 
        background-color: ${this.lighten(colors.warning || '#f59e0b', 0.9)}; 
        color: ${this.darken(colors.warning || '#f59e0b', 0.2)}; 
      }
      .method-delete { 
        background-color: ${this.lighten(colors.danger || '#ef4444', 0.9)}; 
        color: ${this.darken(colors.danger || '#ef4444', 0.2)}; 
      }
      .method-patch { 
        background-color: ${this.lighten(colors.tertiary || '#8b5cf6', 0.9)}; 
        color: ${this.darken(colors.tertiary || '#8b5cf6', 0.2)}; 
      }
      .method-options { 
        background-color: ${this.lighten(colors.neutral || '#6b7280', 0.9)}; 
        color: ${this.darken(colors.neutral || '#6b7280', 0.2)}; 
      }
      .method-head { 
        background-color: ${this.lighten(colors.secondary || '#64748b', 0.9)}; 
        color: ${this.darken(colors.secondary || '#64748b', 0.2)}; 
      }
    `;
  }

  /**
   * Get theme-aware Tailwind classes
   */
  getThemeClasses(themeConfig?: ThemeConfig): Record<string, string> {
    const mode = themeConfig?.mode || 'light';
    
    if (mode === 'dark') {
      return {
        body: 'bg-slate-900 text-slate-100',
        container: 'bg-slate-900',
        card: 'bg-slate-800 border-slate-700',
        surface: 'bg-slate-700',
        text: 'text-slate-100',
        textSecondary: 'text-slate-400',
        border: 'border-slate-600',
        header: 'text-slate-100',
        badge: 'bg-slate-700 text-slate-300',
      };
    }
    
    return {
      body: 'bg-gray-50 text-gray-900',
      container: 'bg-gray-50',
      card: 'bg-white border-gray-200',
      surface: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      header: 'text-gray-900',
      badge: 'bg-gray-100 text-gray-700',
    };
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private lighten(color: string, amount: number): string {
    // Simple color lightening - in production, you might want to use a proper color library
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
      const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
      const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }

  private darken(color: string, amount: number): string {
    // Simple color darkening
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
      const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
      const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }
} 