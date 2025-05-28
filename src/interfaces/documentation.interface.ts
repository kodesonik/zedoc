export interface DocumentationConfig {
  title?: string;
  description?: string;
  version?: string;
  basePath?: string;
  tags?: string[];
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
}

export interface ThemeConfig {
  preset?: 'basic' | 'postman' | 'insomnia' | 'swagger' | 'custom';
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

export interface SidebarConfig {
  position?: 'left' | 'right' | 'none';
  try?: TryPanelConfig;
  searchbar?: boolean;
  tagsFilter?: boolean;
  collapsible?: boolean;
  width?: string;
}

export interface TryPanelConfig {
  enabled?: boolean;
  position?: 'auto' | 'left' | 'right';
  width?: string;
  defaultExpanded?: boolean;
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

export interface ApiDocOptions {
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  operationId?: string;
}

export interface TemplateData {
  title: string;
  description?: string;
  version: string;
  endpoints: EndpointInfo[];
  theme?: ThemeConfig;
  sidebar?: SidebarConfig;
  environment?: EnvironmentConfig;
  branding?: BrandingConfig;
  tags?: string[];
}

export interface EndpointInfo {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterInfo[];
  responses?: ResponseInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  in: 'query' | 'path' | 'header' | 'body';
}

export interface ResponseInfo {
  statusCode: number;
  description: string;
  schema?: any;
}

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