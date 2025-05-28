import { Injectable } from '@nestjs/common';
import { SidebarConfig, TryPanelConfig, EndpointInfo, EnvironmentConfig } from '../interfaces/documentation.interface';
import { EnvironmentService } from './environment.service';

@Injectable()
export class SidebarService {
  constructor(private readonly environmentService: EnvironmentService) {}

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
   * Generate try panel HTML with environment variables support
   */
  generateTryPanelHTML(tryConfig: TryPanelConfig, environmentConfig?: EnvironmentConfig): string {
    if (!tryConfig.enabled) {
      return '';
    }

    const position = tryConfig.position || 'right';
    const width = tryConfig.width || '400px';
    const defaultExpanded = tryConfig.defaultExpanded ? 'true' : 'false';

    const environmentHTML = this.environmentService.generateEnvironmentHTML(environmentConfig);

    return `
      <div id="try-panel" class="try-panel try-panel-${position}" style="width: ${width};" data-default-expanded="${defaultExpanded}">
        <div class="try-panel-header">
          <h3 class="try-panel-title">🧪 Try It Out</h3>
          <button id="try-panel-toggle" class="try-panel-toggle" aria-label="Toggle try panel">
            <span class="try-panel-toggle-icon">◀</span>
          </button>
        </div>
        
        <div class="try-panel-content">
          ${environmentHTML}
          
          <div id="try-panel-endpoint" class="try-endpoint-section" style="display: none;">
            <div class="endpoint-header p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3 mb-2">
                <span id="try-method" class="method-badge"></span>
                <code id="try-path" class="endpoint-path"></code>
              </div>
              <p id="try-summary" class="text-sm text-gray-600 dark:text-gray-400"></p>
            </div>
            
            <div class="endpoint-form p-4 space-y-4">
              <div id="try-parameters" class="parameters-section" style="display: none;">
                <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Parameters</h4>
                <div id="try-parameters-list" class="space-y-3"></div>
              </div>
              
              <div id="try-headers" class="headers-section">
                <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Headers</h4>
                <div id="try-headers-list" class="space-y-2">
                  <div class="header-item flex gap-2">
                    <input type="text" placeholder="Header name" class="flex-1 px-2 py-1 border rounded text-sm">
                    <input type="text" placeholder="Header value" class="flex-1 px-2 py-1 border rounded text-sm">
                    <button class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">×</button>
                  </div>
                </div>
                <button id="add-header" class="mt-2 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
                  + Add Header
                </button>
              </div>
              
              <div id="try-body" class="body-section" style="display: none;">
                <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Request Body</h4>
                <textarea 
                  id="try-body-content" 
                  class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter request body (JSON)"
                ></textarea>
              </div>
              
              <div class="action-buttons flex gap-2">
                <button 
                  id="send-request" 
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                >
                  Send Request
                </button>
                <button 
                  id="clear-try-panel" 
                  class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div id="try-response" class="response-section" style="display: none;">
              <div class="response-header p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Response</h4>
                <div id="response-status" class="mt-1"></div>
              </div>
              <div class="response-content p-4">
                <div id="response-headers" class="mb-4" style="display: none;">
                  <h5 class="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Response Headers</h5>
                  <pre id="response-headers-content" class="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto"></pre>
                </div>
                <div id="response-body">
                  <h5 class="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Response Body</h5>
                  <pre id="response-body-content" class="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto"></pre>
                </div>
              </div>
            </div>
          </div>
          
          <div id="try-panel-placeholder" class="try-placeholder p-8 text-center text-gray-500 dark:text-gray-400">
            <div class="text-4xl mb-4">🎯</div>
            <p class="text-sm">Click on any endpoint to test it here</p>
            <p class="text-xs mt-2">Configure environment variables above for authentication</p>
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
    const environmentJS = this.environmentService.generateEnvironmentJS();
    
    return `
      <script>
        ${environmentJS}
        
        (function() {
          // Sidebar functionality
          const sidebar = document.getElementById('zedoc-sidebar');
          const sidebarToggle = document.getElementById('sidebar-toggle');
          const mainContent = document.querySelector('.main-content');
          const tryPanel = document.getElementById('try-panel');
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
              const icon = tryPanelToggle.querySelector('.try-panel-toggle-icon');
              if (icon) {
                icon.textContent = tryPanel.classList.contains('collapsed') ? '▶' : '◀';
              }
            });
          }
          
          // Initialize try panel state
          if (tryPanel) {
            const defaultExpanded = tryPanel.dataset.defaultExpanded === 'true';
            if (!defaultExpanded) {
              tryPanel.classList.add('collapsed');
              const icon = tryPanelToggle?.querySelector('.try-panel-toggle-icon');
              if (icon) icon.textContent = '▶';
            }
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
              
              if (selectedTags.length === 0) {
                // Show all groups if no tags selected
                const groups = document.querySelectorAll('.endpoint-group');
                groups.forEach(group => {
                  group.style.display = 'block';
                });
              } else {
                // Show only selected tags
                const groups = document.querySelectorAll('.endpoint-group');
                groups.forEach(group => {
                  const tag = group.dataset.tag;
                  group.style.display = selectedTags.includes(tag) ? 'block' : 'none';
                });
              }
            });
          });
          
          // Try panel endpoint functionality
          function loadEndpointInTryPanel(endpoint) {
            const tryPanelEndpoint = document.getElementById('try-panel-endpoint');
            const tryPanelPlaceholder = document.getElementById('try-panel-placeholder');
            
            if (!tryPanelEndpoint || !tryPanelPlaceholder) return;
            
            // Show endpoint section, hide placeholder
            tryPanelEndpoint.style.display = 'block';
            tryPanelPlaceholder.style.display = 'none';
            
            // Populate endpoint details
            document.getElementById('try-method').textContent = endpoint.method;
            document.getElementById('try-method').className = 'method-badge method-' + endpoint.method.toLowerCase();
            document.getElementById('try-path').textContent = endpoint.path;
            document.getElementById('try-summary').textContent = endpoint.summary || '';
            
            // Show/hide sections based on endpoint
            const parametersSection = document.getElementById('try-parameters');
            const bodySection = document.getElementById('try-body');
            
            if (endpoint.parameters && endpoint.parameters.length > 0) {
              parametersSection.style.display = 'block';
              populateParameters(endpoint.parameters);
            } else {
              parametersSection.style.display = 'none';
            }
            
            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
              bodySection.style.display = 'block';
            } else {
              bodySection.style.display = 'none';
            }
            
            // Clear previous response
            document.getElementById('try-response').style.display = 'none';
            
            // Expand try panel if collapsed
            if (tryPanel && tryPanel.classList.contains('collapsed')) {
              tryPanel.classList.remove('collapsed');
              const icon = tryPanelToggle?.querySelector('.try-panel-toggle-icon');
              if (icon) icon.textContent = '◀';
            }
          }
          
          function populateParameters(parameters) {
            const parametersList = document.getElementById('try-parameters-list');
            if (!parametersList) return;
            
            parametersList.innerHTML = parameters.map(param => \`
              <div class="parameter-item">
                <label class="block text-sm font-medium mb-1">
                  \${param.name} 
                  <span class="text-xs text-gray-500">(\${param.in})</span>
                  \${param.required ? '<span class="text-red-500">*</span>' : ''}
                </label>
                <input 
                  type="text" 
                  class="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Enter \${param.name}"
                  data-param-name="\${param.name}"
                  data-param-in="\${param.in}"
                  data-param-required="\${param.required}"
                />
                \${param.description ? \`<p class="text-xs text-gray-500 mt-1">\${param.description}</p>\` : ''}
              </div>
            \`).join('');
          }
          
          // Send request functionality
          const sendRequestBtn = document.getElementById('send-request');
          if (sendRequestBtn) {
            sendRequestBtn.addEventListener('click', async function() {
              const method = document.getElementById('try-method')?.textContent;
              const path = document.getElementById('try-path')?.textContent;
              
              if (!method || !path) return;
              
              // Collect headers
              const headers = { 'Content-Type': 'application/json' };
              
              // Add environment headers
              if (window.zedocEnvironment && window.zedocEnvironment.headers) {
                Object.assign(headers, window.zedocEnvironment.headers);
              }
              
              // Add custom headers
              const headerInputs = document.querySelectorAll('#try-headers-list .header-item');
              headerInputs.forEach(item => {
                const nameInput = item.querySelector('input[placeholder="Header name"]');
                const valueInput = item.querySelector('input[placeholder="Header value"]');
                if (nameInput?.value && valueInput?.value) {
                  headers[nameInput.value] = valueInput.value;
                }
              });
              
              // Collect parameters
              const params = new URLSearchParams();
              const paramInputs = document.querySelectorAll('[data-param-name]');
              paramInputs.forEach(input => {
                if (input.value && input.dataset.paramIn === 'query') {
                  params.append(input.dataset.paramName, input.value);
                }
              });
              
              // Build URL
              let url = path;
              if (params.toString()) {
                url += '?' + params.toString();
              }
              
              // Collect body
              let body = null;
              if (['POST', 'PUT', 'PATCH'].includes(method)) {
                const bodyContent = document.getElementById('try-body-content')?.value;
                if (bodyContent) {
                  try {
                    body = JSON.stringify(JSON.parse(bodyContent));
                  } catch (e) {
                    body = bodyContent;
                  }
                }
              }
              
              // Show loading state
              sendRequestBtn.textContent = 'Sending...';
              sendRequestBtn.disabled = true;
              
              try {
                const response = await fetch(url, {
                  method,
                  headers,
                  body
                });
                
                // Show response
                displayResponse(response);
                
              } catch (error) {
                displayError(error);
              } finally {
                sendRequestBtn.textContent = 'Send Request';
                sendRequestBtn.disabled = false;
              }
            });
          }
          
          async function displayResponse(response) {
            const responseSection = document.getElementById('try-response');
            const statusEl = document.getElementById('response-status');
            const headersEl = document.getElementById('response-headers-content');
            const bodyEl = document.getElementById('response-body-content');
            
            if (!responseSection) return;
            
            responseSection.style.display = 'block';
            
            // Status
            const statusClass = response.ok ? 'text-green-600' : 'text-red-600';
            statusEl.innerHTML = \`<span class="\${statusClass} font-mono">\${response.status} \${response.statusText}</span>\`;
            
            // Headers
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });
            headersEl.textContent = JSON.stringify(responseHeaders, null, 2);
            document.getElementById('response-headers').style.display = 'block';
            
            // Body
            try {
              const text = await response.text();
              let formattedBody = text;
              
              try {
                const json = JSON.parse(text);
                formattedBody = JSON.stringify(json, null, 2);
              } catch (e) {
                // Not JSON, use as is
              }
              
              bodyEl.textContent = formattedBody;
            } catch (error) {
              bodyEl.textContent = 'Error reading response body: ' + error.message;
            }
          }
          
          function displayError(error) {
            const responseSection = document.getElementById('try-response');
            const statusEl = document.getElementById('response-status');
            const bodyEl = document.getElementById('response-body-content');
            
            if (!responseSection) return;
            
            responseSection.style.display = 'block';
            statusEl.innerHTML = '<span class="text-red-600 font-mono">Error</span>';
            bodyEl.textContent = error.message;
            document.getElementById('response-headers').style.display = 'none';
          }
          
          // Clear try panel
          const clearBtn = document.getElementById('clear-try-panel');
          if (clearBtn) {
            clearBtn.addEventListener('click', function() {
              // Clear all inputs
              document.querySelectorAll('#try-panel input, #try-panel textarea').forEach(input => {
                if (!input.dataset.variableName) { // Don't clear environment variables
                  input.value = '';
                }
              });
              
              // Hide response
              document.getElementById('try-response').style.display = 'none';
            });
          }
          
          // Add header functionality
          const addHeaderBtn = document.getElementById('add-header');
          if (addHeaderBtn) {
            addHeaderBtn.addEventListener('click', function() {
              const headersList = document.getElementById('try-headers-list');
              const newHeader = document.createElement('div');
              newHeader.className = 'header-item flex gap-2';
              newHeader.innerHTML = \`
                <input type="text" placeholder="Header name" class="flex-1 px-2 py-1 border rounded text-sm">
                <input type="text" placeholder="Header value" class="flex-1 px-2 py-1 border rounded text-sm">
                <button class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">×</button>
              \`;
              
              // Add remove functionality
              newHeader.querySelector('button').addEventListener('click', function() {
                newHeader.remove();
              });
              
              headersList.appendChild(newHeader);
            });
          }
          
          // Remove header functionality for existing headers
          document.querySelectorAll('#try-headers-list .header-item button').forEach(btn => {
            btn.addEventListener('click', function() {
              btn.closest('.header-item').remove();
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
                
                // Load endpoint in try panel
                const endpoint = {
                  method: this.dataset.method,
                  path: this.dataset.path,
                  summary: this.querySelector('.endpoint-summary')?.textContent || '',
                  parameters: [] // TODO: Extract from endpoint data
                };
                loadEndpointInTryPanel(endpoint);
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