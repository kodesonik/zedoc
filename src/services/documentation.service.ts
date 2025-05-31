import { Injectable, Inject, Logger } from '@nestjs/common';
import { 
  DocumentationConfig, 
  TemplateData, 
  SectionConfig,
  Endpoint,
} from '../interfaces/documentation.interface';
import { ThemeService } from './theme.service';
import { SidebarService } from './sidebar.service';
import { FontService } from './font.service';
import { EnvironmentService } from './environment.service';
import { BrandingService } from './branding.service';
import * as hbs from 'hbs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentationService {
  private config: DocumentationConfig = {};

  constructor(
    @Inject('DOCUMENTATION_CONFIG') config: DocumentationConfig,
    private readonly themeService: ThemeService,
    private readonly sidebarService: SidebarService,
    private readonly fontService: FontService,
    private readonly environmentService: EnvironmentService,
    private readonly brandingService: BrandingService,
  ) {
    this.config = { ...this.config, ...config };
    this.setupHandlebars();
  }

  setConfig(config: DocumentationConfig): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DocumentationConfig {
    return this.config;
  }

  private setupHandlebars(): void {
    // Register Handlebars helpers
    hbs.registerHelper('eq', (a: any, b: any) => a === b);
    hbs.registerHelper('unless', (conditional: any, options: any) => {
      if (!conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    hbs.registerHelper('uppercase', (str: string) => str?.toUpperCase());
    hbs.registerHelper('lowercase', (str: string) => str?.toLowerCase());
    hbs.registerHelper('json', (obj: any) => JSON.stringify(obj, null, 2));
    hbs.registerHelper('formatTags', (tags: string | string[]) => {
      if (Array.isArray(tags)) {
        return tags.join(', ');
      }
      return tags || '';
    });
    
    hbs.registerHelper('formatRoles', (roles: string | string[]) => {
      if (Array.isArray(roles)) {
        return roles.join(', ');
      }
      return roles || '';
    });
    
    // Theme-related helpers
    hbs.registerHelper('themeClass', (className: string, context: any) => {
      const themeClasses = this.themeService.getThemeClasses(context.data.root.theme);
      return themeClasses[className] || '';
    });
    
    hbs.registerHelper('themeCSS', (context: any) => {
      return new hbs.SafeString(this.themeService.generateThemeCSS(context.data.root.theme));
    });
    
    hbs.registerHelper('methodColors', (context: any) => {
      return new hbs.SafeString(this.themeService.generateMethodColors(context.data.root.theme));
    });

    // Font-related helpers
    hbs.registerHelper('fontCSS', (context: any) => {
      return new hbs.SafeString(this.fontService.generateFontCSS(context.data.root.theme?.fonts));
    });

    hbs.registerHelper('responsiveFontCSS', (context: any) => {
      return new hbs.SafeString(this.fontService.generateResponsiveFontCSS(context.data.root.theme?.fonts));
    });

    hbs.registerHelper('fontClass', (className: string, context: any) => {
      const fontClasses = this.fontService.getFontClasses(context.data.root.theme?.fonts);
      return fontClasses[className] || '';
    });

    // Sidebar-related helpers (Swagger mode)
    hbs.registerHelper('sidebarHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const endpoints = context.data.root.endpoints || [];
      const tags = context.data.root.tags || [];
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.sidebarService.generateSidebarHTML(sidebarConfig, endpoints, tags, brandingConfig));
    });

    // Structured sidebar helper
    hbs.registerHelper('structuredSidebarHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const sections = context.data.root.sections || [];
      const tags = this.extractTagsFromSections(sections);
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.generateStructuredSidebarHTML(sidebarConfig, sections, tags, brandingConfig));
    });

    hbs.registerHelper('tryPanelHTML', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      const environmentConfig = context.data.root.environment;
      return new hbs.SafeString(this.sidebarService.generateTryPanelHTML(sidebarConfig.try!, environmentConfig));
    });

    hbs.registerHelper('sidebarCSS', (context: any) => {
      const sidebarConfig = this.sidebarService.getResolvedSidebarConfig(context.data.root.sidebar);
      return new hbs.SafeString(this.sidebarService.generateSidebarCSS(sidebarConfig));
    });

    hbs.registerHelper('sidebarJS', () => {
      return new hbs.SafeString(this.sidebarService.generateSidebarJS());
    });

    // Environment-related helpers
    hbs.registerHelper('environmentHTML', (context: any) => {
      const environmentConfig = context.data.root.environment;
      return new hbs.SafeString(this.environmentService.generateEnvironmentHTML(environmentConfig));
    });

    hbs.registerHelper('environmentJS', () => {
      return new hbs.SafeString(this.environmentService.generateEnvironmentJS());
    });

    // Branding-related helpers
    hbs.registerHelper('faviconHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateFaviconHTML(brandingConfig));
    });

    hbs.registerHelper('headerLogoHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateHeaderLogoHTML(brandingConfig));
    });

    hbs.registerHelper('coverHTML', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateCoverHTML(brandingConfig));
    });

    hbs.registerHelper('brandingCSS', (context: any) => {
      const brandingConfig = context.data.root.branding;
      return new hbs.SafeString(this.brandingService.generateBrandingCSS(brandingConfig));
    });

    // Swagger mode helpers
    hbs.registerHelper('endpointId', (endpoint: Endpoint) => {
      return `endpoint-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    });

    // Structured mode helpers
    hbs.registerHelper('structuredEndpointId', (sectionId: string, moduleId: string, endpoint: Endpoint) => {
      return `endpoint-${sectionId}-${moduleId}-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    });

    hbs.registerHelper('moduleId', (sectionId: string, moduleId: string) => {
      return `module-${sectionId}-${moduleId}`;
    });

    hbs.registerHelper('sectionId', (sectionId: string) => {
      return `section-${sectionId}`;
    });

    hbs.registerHelper('authBadge', (requiresAuth: boolean) => {
      if (requiresAuth) {
        return new hbs.SafeString('<span class="auth-required-badge">🔒 Auth Required</span>');
      }
      return '';
    });

    hbs.registerHelper('formatErrorResponses', (errorResponses: any[]) => {
      if (!errorResponses || errorResponses.length === 0) return '';
      
      return errorResponses.map(error => `
        <div class="error-response">
          <span class="error-status">${error.status}</span>
          <span class="error-description">${error.description}</span>
          ${error.error ? `<div class="error-code">${error.error}</div>` : ''}
          ${error.message ? `<div class="error-message">${error.message}</div>` : ''}
        </div>
      `).join('');
    });
  }

  /**
   * Generate documentation (unified method supporting both modes)
   */
  generateDocumentation(doc:any, sections: SectionConfig[], configOverride?: Partial<DocumentationConfig>): string {    
    // Swagger mode
    const tags = this.extractTagsFromSections(sections || []);
    
    // Merge base config with override
    const effectiveConfig = {
      ...this.config,
      ...configOverride,
      theme: {
        ...this.config.theme,
        ...configOverride?.theme,
      }
    };
    
    const templateData: TemplateData = {
      title: doc.info?.title || effectiveConfig.title || 'API Documentation',
      description: doc.info?.description || effectiveConfig.description,
      version: doc.info?.version || effectiveConfig.version || '1.0.0',
      sections,
      tags,
      roles: effectiveConfig.roles,
      theme: effectiveConfig.theme,
      sidebar: effectiveConfig.sidebar,
      environment: effectiveConfig.environment,
      branding: effectiveConfig.branding,
    };

    const templatePath = path.join(__dirname, '../templates/documentation.hbs');
    const template = this.loadTemplate(templatePath);
    const compiledTemplate = hbs.compile(template);
    
    return compiledTemplate(templateData);
  }

  private loadTemplate(templatePath: string): string {
    try {
      Logger.log(`Loading template: ${templatePath}`);
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Fallback to default unified template if file doesn't exist
      Logger.error(`Error loading template: ${error}`);
      // return this.getDefaultUnifiedTemplate();
    }
  }

  /**
   * Extract tags from all sections and modules
   */
  private extractTagsFromSections(sections: SectionConfig[]): string[] {
    const tagsSet = new Set<string>();
    
    sections.forEach(section => {
      section.modules.forEach(module => {
        module.endpoints.forEach(endpoint => {
          if (endpoint.tags) {
            if (Array.isArray(endpoint.tags)) {
              endpoint.tags.forEach(tag => tagsSet.add(tag));
            } else {
              tagsSet.add(endpoint.tags);
            }
          }
        });
      });
    });
    
    return Array.from(tagsSet).sort();
  }

  /**
   * Generate structured sidebar HTML
   */
  private generateStructuredSidebarHTML(sidebarConfig: any, sections: SectionConfig[], roles: string[], brandingConfig?: any): string {
    if (sidebarConfig.position === 'none') {
      return '';
    }

    const sidebarClass = `sidebar-${sidebarConfig.position}`;
    const collapsibleClass = sidebarConfig.collapsible ? 'collapsible' : '';
    const sidebarLogo = this.brandingService.generateSidebarLogoHTML(brandingConfig);

    let sectionsHTML = '';
    sections.forEach(section => {
      sectionsHTML += `
        <div class="section-group" data-section="${section.id}">
          <h3 class="section-title">${section.name}</h3>
          <div class="section-modules">
      `;
      
      section.modules.forEach(module => {
        sectionsHTML += `
          <div class="module-group" data-module="${module.id}">
            <h4 class="module-title">${module.name}</h4>
            <div class="module-endpoints">
        `;
        
        module.endpoints.forEach(endpoint => {
          const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
          const authIcon = endpoint.requiresAuth ? '🔒 ' : '';
          sectionsHTML += `
            <a href="#endpoint-${section.id}-${module.id}-${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}" 
               class="endpoint-link" 
               data-method="${endpoint.method}" 
               data-path="${endpoint.path}"
               data-requires-auth="${endpoint.requiresAuth}">
              <span class="endpoint-title">${authIcon}${title}</span>
            </a>
          `;
        });
        
        sectionsHTML += `
            </div>
          </div>
        `;
      });
      
      sectionsHTML += `
          </div>
        </div>
      `;
    });

    return `
      <div id="zedoc-sidebar" class="${sidebarClass} ${collapsibleClass}" style="width: ${sidebarConfig.width}">
        ${sidebarLogo}
        <div class="sidebar-header">
          <h3 class="sidebar-title">API Navigation</h3>
          ${sidebarConfig.collapsible ? '<button id="sidebar-toggle" class="sidebar-toggle">×</button>' : ''}
        </div>
        
        <div class="sidebar-content">
          ${sidebarConfig.searchbar ? this.generateSearchBar() : ''}
          ${sidebarConfig.rolesFilter ? this.generateRolesFilter(this.config.roles || roles) : ''}
          <div class="sections-list">
            ${sectionsHTML}
          </div>
        </div>
      </div>
    `;
  }

  private generateSearchBar(): string {
    return `
      <div class="search-section">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            id="endpoint-search" 
            placeholder="Search endpoints..." 
            class="search-input"
          />
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
    `;
  }

  private generateRolesFilter(roles: string[]): string {
    if (roles.length === 0) return '';

    const roleOptions = roles.map(role => 
      `<label class="tag-filter-item">
        <input type="checkbox" value="${role}" checked> 
        <span class="tag-name">${role}</span>
      </label>`
    ).join('');

    return `
      <div class="tags-filter-section">
        <h4 class="filter-title">Filter by Tags</h4>
        <div class="tags-filter-list">
          ${roleOptions}
        </div>
      </div>
    `;
  }

  /**
   * Convert EndpointConfig to ApiEndpoint format
   */
  // convertEndpointConfigToApiEndpoint(endpoint: Endpoint): ApiEndpoint {
  //   return {
  //     method: endpoint.method,
  //     path: endpoint.path,
  //     summary: endpoint.summary,
  //     description: endpoint.description,
  //     requiresAuth: endpoint.requiresAuth || false,
  //     tags: endpoint.tags || [],
  //     requestHeaders: endpoint.additionalHeaders,
  //     requestBody: endpoint.requestBody,
  //     successResponse: endpoint.successData,
  //     responseExample: endpoint.successMessage,
  //     errorResponses: endpoint.errorResponses?.map(err => ({
  //       status: err.status,
  //       description: err.description,
  //       example: { error: err.error, message: err.message }
  //     }))
  //   };
  // }
} 