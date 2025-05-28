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
}

export interface ThemeConfig {
  preset?: 'basic' | 'postman' | 'insomnia' | 'swagger' | 'custom';
  mode?: 'light' | 'dark';
  colors?: ThemeColors;
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