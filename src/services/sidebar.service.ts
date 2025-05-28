import { Injectable } from '@nestjs/common';
import { SidebarConfig, TryPanelConfig, EndpointInfo } from '../interfaces/documentation.interface';

@Injectable()
export class SidebarService {
  /**
   * Get resolved sidebar configuration with defaults
   */
  getResolvedSidebarConfig(sidebarConfig?: SidebarConfig): SidebarConfig {
    return {
      position: sidebarConfig?.position || 'left',
      searchbar: sidebarConfig?.searchbar !== false, // default true
      tagsFilter: sidebarConfig?.tagsFilter !== false, // default true
      collapsible: sidebarConfig?.collapsible !== false, // default true
      width: sidebarConfig?.width || '320px',
      try: this.getResolvedTryConfig(sidebarConfig?.try, sidebarConfig?.position),
    };
  }

  /**
   * Get resolved try panel configuration
   */
  private getResolvedTryConfig(tryConfig?: TryPanelConfig, sidebarPosition?: string): TryPanelConfig {
    const enabled = tryConfig?.enabled !== false; // default true
    let position = tryConfig?.position || 'auto';
    
    // Auto position: opposite side of sidebar
    if (position === 'auto') {
      if (sidebarPosition === 'right') {
        position = 'left';
      } else if (sidebarPosition === 'left') {
        position = 'right';
      } else {
        position = 'right'; // default when no sidebar
      }
    }

    return {
      enabled,
      position: position as 'left' | 'right',
      width: tryConfig?.width || '400px',
      defaultExpanded: tryConfig?.defaultExpanded || false,
    };
  }

  /**
   * Extract unique tags from endpoints
   */
  extractTags(endpoints: EndpointInfo[]): string[] {
    const tagsSet = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }

  /**
   * Generate sidebar HTML structure
   */
  generateSidebarHTML(sidebarConfig: SidebarConfig, endpoints: EndpointInfo[], tags: string[]): string {
    if (sidebarConfig.position === 'none') {
      return '';
    }

    const sidebarClass = `sidebar-${sidebarConfig.position}`;
    const collapsibleClass = sidebarConfig.collapsible ? 'collapsible' : '';

    return `
      <div id="zedoc-sidebar" class="${sidebarClass} ${collapsibleClass}" style="width: ${sidebarConfig.width}">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Navigation</h3>
          ${sidebarConfig.collapsible ? '<button id="sidebar-toggle" class="sidebar-toggle">×</button>' : ''}
        </div>
        
        <div class="sidebar-content">
          ${sidebarConfig.searchbar ? this.generateSearchBar() : ''}
          ${sidebarConfig.tagsFilter ? this.generateTagsFilter(tags) : ''}
          ${this.generateEndpointsList(endpoints)}
        </div>
      </div>
    `;
  }

  /**
   * Generate search bar HTML
   */
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

  /**
   * Generate tags filter HTML
   */
  private generateTagsFilter(tags: string[]): string {
    if (tags.length === 0) return '';

    const tagOptions = tags.map(tag => 
      `<label class="tag-filter-item">
        <input type="checkbox" value="${tag}" checked> 
        <span class="tag-name">${tag}</span>
      </label>`
    ).join('');

    return `
      <div class="tags-filter-section">
        <h4 class="filter-title">Filter by Tags</h4>
        <div class="tags-filter-list">
          ${tagOptions}
        </div>
      </div>
    `;
  }

  /**
   * Generate endpoints list HTML
   */
  private generateEndpointsList(endpoints: EndpointInfo[]): string {
    const groupedEndpoints = this.groupEndpointsByTag(endpoints);
    
    let html = '<div class="endpoints-list">';
    
    Object.entries(groupedEndpoints).forEach(([tag, tagEndpoints]) => {
      html += `
        <div class="endpoint-group" data-tag="${tag}">
          <h4 class="group-title">${tag}</h4>
          <div class="group-endpoints">
      `;
      
      tagEndpoints.forEach(endpoint => {
        const methodClass = `method-${endpoint.method.toLowerCase()}`;
        html += `
          <a href="#endpoint-${this.generateEndpointId(endpoint)}" class="endpoint-link" data-method="${endpoint.method}" data-path="${endpoint.path}">
            <span class="endpoint-method ${methodClass}">${endpoint.method}</span>
            <span class="endpoint-path">${endpoint.path}</span>
            ${endpoint.summary ? `<span class="endpoint-summary">${endpoint.summary}</span>` : ''}
          </a>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Group endpoints by their first tag
   */
  private groupEndpointsByTag(endpoints: EndpointInfo[]): Record<string, EndpointInfo[]> {
    const grouped: Record<string, EndpointInfo[]> = {};
    
    endpoints.forEach(endpoint => {
      const tag = endpoint.tags?.[0] || 'General';
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push(endpoint);
    });
    
    return grouped;
  }

  /**
   * Generate try panel HTML
   */
  generateTryPanelHTML(tryConfig: TryPanelConfig): string {
    if (!tryConfig.enabled) {
      return '';
    }

    const panelClass = `try-panel-${tryConfig.position}`;
    const expandedClass = tryConfig.defaultExpanded ? 'expanded' : 'collapsed';

    return `
      <div id="zedoc-try-panel" class="${panelClass} ${expandedClass}" style="width: ${tryConfig.width}">
        <div class="try-panel-header">
          <h3 class="try-panel-title">Try It Out</h3>
          <button id="try-panel-toggle" class="try-panel-toggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>
        
        <div class="try-panel-content">
          <div id="try-panel-form">
            <p class="try-panel-placeholder">Select an endpoint to try it out</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate sidebar CSS
   */
  generateSidebarCSS(sidebarConfig: SidebarConfig): string {
    if (sidebarConfig.position === 'none') {
      return '';
    }

    const tryConfig = sidebarConfig.try!;
    
    return `
      /* Sidebar Styles */
      #zedoc-sidebar {
        position: fixed;
        top: 0;
        ${sidebarConfig.position}: 0;
        height: 100vh;
        background: var(--zedoc-surface, #f8fafc);
        border-${sidebarConfig.position === 'left' ? 'right' : 'left'}: 1px solid var(--zedoc-border, #e2e8f0);
        z-index: 1000;
        overflow-y: auto;
        transition: transform 0.3s ease;
      }

      #zedoc-sidebar.collapsed {
        transform: translateX(${sidebarConfig.position === 'left' ? '-100%' : '100%'});
      }

      .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .sidebar-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--zedoc-text, #1e293b);
      }

      .sidebar-toggle {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--zedoc-text-secondary, #64748b);
        padding: 0.25rem;
        border-radius: 0.25rem;
      }

      .sidebar-toggle:hover {
        background: var(--zedoc-background, #ffffff);
      }

      .sidebar-content {
        padding: 1rem;
      }

      /* Search Section */
      .search-section {
        margin-bottom: 1.5rem;
      }

      .search-input-wrapper {
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 0.5rem 0.75rem 0.5rem 2.5rem;
        border: 1px solid var(--zedoc-border, #e2e8f0);
        border-radius: 0.375rem;
        background: var(--zedoc-background, #ffffff);
        color: var(--zedoc-text, #1e293b);
        font-size: 0.875rem;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--zedoc-primary, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--zedoc-text-secondary, #64748b);
      }

      /* Tags Filter */
      .tags-filter-section {
        margin-bottom: 1.5rem;
      }

      .filter-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--zedoc-text, #1e293b);
        margin: 0 0 0.75rem 0;
      }

      .tags-filter-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tag-filter-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .tag-filter-item input[type="checkbox"] {
        margin: 0;
      }

      .tag-name {
        color: var(--zedoc-text-secondary, #64748b);
      }

      /* Endpoints List */
      .endpoints-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .endpoint-group {
        border-radius: 0.375rem;
        overflow: hidden;
      }

      .group-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--zedoc-text, #1e293b);
        margin: 0 0 0.5rem 0;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
      }

      .group-endpoints {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .endpoint-link {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem;
        border-radius: 0.25rem;
        text-decoration: none;
        transition: background-color 0.2s;
        border: 1px solid transparent;
      }

      .endpoint-link:hover {
        background: var(--zedoc-background, #ffffff);
        border-color: var(--zedoc-border, #e2e8f0);
      }

      .endpoint-method {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        width: fit-content;
      }

      .endpoint-path {
        font-family: monospace;
        font-size: 0.875rem;
        color: var(--zedoc-text, #1e293b);
        font-weight: 500;
      }

      .endpoint-summary {
        font-size: 0.75rem;
        color: var(--zedoc-text-secondary, #64748b);
      }

      /* Try Panel Styles */
      ${tryConfig.enabled ? this.generateTryPanelCSS(tryConfig) : ''}

      /* Main Content Adjustment */
      .main-content {
        margin-${sidebarConfig.position}: ${sidebarConfig.width};
        ${tryConfig.enabled ? `margin-${tryConfig.position}: ${tryConfig.width};` : ''}
        transition: margin 0.3s ease;
      }

      .main-content.sidebar-collapsed {
        margin-${sidebarConfig.position}: 0;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        #zedoc-sidebar {
          width: 280px !important;
        }
        
        .main-content {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        #zedoc-sidebar:not(.collapsed) {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        }
      }
    `;
  }

  /**
   * Generate try panel CSS
   */
  private generateTryPanelCSS(tryConfig: TryPanelConfig): string {
    return `
      /* Try Panel Styles */
      #zedoc-try-panel {
        position: fixed;
        top: 0;
        ${tryConfig.position}: 0;
        height: 100vh;
        background: var(--zedoc-surface, #f8fafc);
        border-${tryConfig.position === 'left' ? 'right' : 'left'}: 1px solid var(--zedoc-border, #e2e8f0);
        z-index: 999;
        overflow-y: auto;
        transition: transform 0.3s ease;
      }

      #zedoc-try-panel.collapsed {
        transform: translateX(${tryConfig.position === 'left' ? '-100%' : '100%'});
      }

      .try-panel-header {
        padding: 1rem;
        border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .try-panel-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--zedoc-text, #1e293b);
      }

      .try-panel-toggle {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--zedoc-text-secondary, #64748b);
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: transform 0.3s ease;
      }

      .try-panel-toggle:hover {
        background: var(--zedoc-background, #ffffff);
      }

      #zedoc-try-panel.collapsed .try-panel-toggle {
        transform: rotate(180deg);
      }

      .try-panel-content {
        padding: 1rem;
      }

      .try-panel-placeholder {
        color: var(--zedoc-text-secondary, #64748b);
        text-align: center;
        margin: 2rem 0;
      }
    `;
  }

  /**
   * Generate sidebar JavaScript
   */
  generateSidebarJS(): string {
    return `
      <script>
        (function() {
          // Sidebar functionality
          const sidebar = document.getElementById('zedoc-sidebar');
          const sidebarToggle = document.getElementById('sidebar-toggle');
          const mainContent = document.querySelector('.main-content');
          const tryPanel = document.getElementById('zedoc-try-panel');
          const tryPanelToggle = document.getElementById('try-panel-toggle');
          
          // Sidebar toggle
          if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
              sidebar.classList.toggle('collapsed');
              if (mainContent) {
                mainContent.classList.toggle('sidebar-collapsed');
              }
            });
          }
          
          // Try panel toggle
          if (tryPanelToggle) {
            tryPanelToggle.addEventListener('click', function() {
              tryPanel.classList.toggle('collapsed');
            });
          }
          
          // Search functionality
          const searchInput = document.getElementById('endpoint-search');
          if (searchInput) {
            searchInput.addEventListener('input', function() {
              const searchTerm = this.value.toLowerCase();
              const endpointLinks = document.querySelectorAll('.endpoint-link');
              
              endpointLinks.forEach(link => {
                const method = link.dataset.method.toLowerCase();
                const path = link.dataset.path.toLowerCase();
                const summary = link.querySelector('.endpoint-summary')?.textContent.toLowerCase() || '';
                
                const matches = method.includes(searchTerm) || 
                               path.includes(searchTerm) || 
                               summary.includes(searchTerm);
                
                link.style.display = matches ? 'flex' : 'none';
              });
              
              // Hide empty groups
              const groups = document.querySelectorAll('.endpoint-group');
              groups.forEach(group => {
                const visibleLinks = group.querySelectorAll('.endpoint-link[style*="flex"]');
                group.style.display = visibleLinks.length > 0 ? 'block' : 'none';
              });
            });
          }
          
          // Tags filter functionality
          const tagFilters = document.querySelectorAll('.tag-filter-item input[type="checkbox"]');
          tagFilters.forEach(filter => {
            filter.addEventListener('change', function() {
              const selectedTags = Array.from(tagFilters)
                .filter(f => f.checked)
                .map(f => f.value);
              
              const groups = document.querySelectorAll('.endpoint-group');
              groups.forEach(group => {
                const tag = group.dataset.tag;
                group.style.display = selectedTags.includes(tag) ? 'block' : 'none';
              });
            });
          });
          
          // Smooth scrolling for endpoint links
          const endpointLinks = document.querySelectorAll('.endpoint-link');
          endpointLinks.forEach(link => {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href').substring(1);
              const targetElement = document.getElementById(targetId);
              
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
                
                // Highlight the target endpoint
                targetElement.classList.add('highlighted');
                setTimeout(() => {
                  targetElement.classList.remove('highlighted');
                }, 2000);
              }
            });
          });
          
          // Auto-hide sidebar on mobile when clicking endpoint
          if (window.innerWidth <= 768) {
            endpointLinks.forEach(link => {
              link.addEventListener('click', function() {
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                  sidebar.classList.add('collapsed');
                  if (mainContent) {
                    mainContent.classList.add('sidebar-collapsed');
                  }
                }
              });
            });
          }
        })();
      </script>
    `;
  }

  /**
   * Generate unique endpoint ID
   */
  private generateEndpointId(endpoint: EndpointInfo): string {
    return `${endpoint.method.toLowerCase()}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }
} 