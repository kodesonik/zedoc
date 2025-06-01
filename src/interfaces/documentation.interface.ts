export interface DocumentationConfig {
  title?: string;
  description?: string;
  version?: string;
  basePath?: string;
  tags?: string[];
  roles?: string[];
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
  sections?: SectionConfig[];
}

// Sections
export interface SectionConfig {
  id: string;
  name: string;
  modules: ModuleConfig[];
}

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  deprecated?: boolean;
  method: string;
  path: string;
  summary: string;
  description: string;
  requiresAuth?: boolean;
  tags: string[];
  additionalHeaders?: Record<string, string>;
  requestBody?: Record<string, any>;
  successData?: any;
  successMessage?: string;
  successStatus?: number;
  errorResponses?: Array<{
    status: number;
    description: string;
    error: string;
    message: string;
  }>;
  // Enhanced fields for complex APIs
  parameters?: Array<{
    name: string;
    in: string;
    required: boolean;
    description: string;
    type: string;
    example: any;
  }>;
  requestExamples?: Array<{
    name: string;
    summary: string;
    value: any;
  }>;
  responseExamples?: Array<{
    name: string;
    summary: string;
    status: number;
    value: any;
  }>;
}

// Sidebar
export interface SidebarConfig {
  position?: 'left' | 'right' | 'none';
  try?: TryPanelConfig;
  searchbar?: boolean;
  rolesFilter?: boolean;
  collapsible?: boolean;
  width?: string;
}

// Try Panel
export interface TryPanelConfig {
  enabled?: boolean;
  position?: 'auto' | 'left' | 'right';
  width?: string;
  defaultExpanded?: boolean;
}

// Theme
export interface ThemeConfig {
  preset?: 'default' | 'postman' | 'insomnia' | 'swagger' | 'custom';
  mode?: 'light' | 'dark';
  colors?: ThemeColors;
  fonts?: FontConfig;
}

export interface FontConfig {
  size?: 'sm' | 'md' | 'lg' | 'custom';
  family?: 'inter' | 'roboto' | 'system' | 'custom';
  customSizes?: FontSizes;
  customFamily?: string;
}

export interface FontSizes {
  xs?: string;
  sm?: string;
  base?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  '3xl'?: string;
  '4xl'?: string;
  '5xl'?: string;
}

export interface ThemeColors {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  neutral?: string;
  light?: string;
  dark?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
}

// Environment
export interface EnvironmentConfig {
  variables?: EnvironmentVariable[];
  defaultTokens?: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    bearerToken?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
  description?: string;
  type?: 'token' | 'header' | 'query' | 'body' | 'custom';
  sensitive?: boolean;
}

// Branding
export interface BrandingConfig {
  favicon?: string;
  logo?: LogoConfig;
  cover?: CoverConfig;
}

export interface LogoConfig {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  position?: 'header' | 'sidebar' | 'both';
  link?: string;
}

export interface CoverConfig {
  src?: string;
  alt?: string;
  position?: 'top' | 'background' | 'hero';
  height?: string;
  opacity?: number;
  overlay?: boolean;
  overlayColor?: string;
}

export interface TemplateData {
  title: string;
  description?: string;
  version?: string;
  sections?: SectionConfig[];
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
  tags?: string[];
  roles?: string[];
} 
