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
  endpoints: EndpointInfo[];
  version?: string;
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