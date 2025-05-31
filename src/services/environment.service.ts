import { Injectable } from '@nestjs/common';
import { EnvironmentConfig, EnvironmentVariable } from '../interfaces/documentation.interface';

@Injectable()
export class EnvironmentService {
  private readonly defaultEnvironmentConfig: EnvironmentConfig = {
    variables: [
      {
        name: 'accessToken',
        value: '',
        description: 'JWT access token for API authentication',
        type: 'token',
        sensitive: true,
      },
      {
        name: 'refreshToken',
        value: '',
        description: 'JWT refresh token for token renewal',
        type: 'token',
        sensitive: true,
      },
    ],
    defaultTokens: {
      accessToken: '',
      refreshToken: '',
      apiKey: '',
      bearerToken: '',
    },
    headers: {},
    queryParams: {},
  };

  /**
   * Get resolved environment configuration with defaults
   */
  getResolvedEnvironmentConfig(envConfig?: EnvironmentConfig): Required<EnvironmentConfig> {
    const resolved = {
      variables: envConfig?.variables || this.defaultEnvironmentConfig.variables || [],
      defaultTokens: {
        ...this.defaultEnvironmentConfig.defaultTokens,
        ...envConfig?.defaultTokens,
      },
      headers: {
        ...this.defaultEnvironmentConfig.headers,
        ...envConfig?.headers,
      },
      queryParams: {
        ...this.defaultEnvironmentConfig.queryParams,
        ...envConfig?.queryParams,
      },
    };

    // Add default variables if not present
    const hasAccessToken = resolved.variables.some(v => v.name === 'accessToken');
    const hasRefreshToken = resolved.variables.some(v => v.name === 'refreshToken');

    if (!hasAccessToken) {
      resolved.variables.push({
        name: 'accessToken',
        value: resolved.defaultTokens.accessToken || '',
        description: 'JWT access token for API authentication',
        type: 'token',
        sensitive: true,
      });
    }

    if (!hasRefreshToken) {
      resolved.variables.push({
        name: 'refreshToken',
        value: resolved.defaultTokens.refreshToken || '',
        description: 'JWT refresh token for token renewal',
        type: 'token',
        sensitive: true,
      });
    }

    return resolved;
  }

  /**
   * Get environment variables by type
   */
  getVariablesByType(envConfig?: EnvironmentConfig, type?: string): EnvironmentVariable[] {
    const resolved = this.getResolvedEnvironmentConfig(envConfig);
    
    if (!type) {
      return resolved.variables;
    }
    
    return resolved.variables.filter(variable => variable.type === type);
  }

  /**
   * Get authentication headers from environment config
   */
  getAuthHeaders(envConfig?: EnvironmentConfig): Record<string, string> {
    const resolved = this.getResolvedEnvironmentConfig(envConfig);
    const authHeaders: Record<string, string> = {};

    // Add token-based headers
    const tokenVariables = this.getVariablesByType(envConfig, 'token');
    tokenVariables.forEach(variable => {
      if (variable.value) {
        switch (variable.name) {
          case 'accessToken':
          case 'bearerToken':
            authHeaders['Authorization'] = `Bearer ${variable.value}`;
            break;
          case 'apiKey':
            authHeaders['X-API-Key'] = variable.value;
            break;
          default:
            authHeaders[`X-${variable.name}`] = variable.value;
        }
      }
    });

    // Add custom headers
    Object.entries(resolved.headers).forEach(([key, value]) => {
      authHeaders[key] = value;
    });

    return authHeaders;
  }

  /**
   * Generate environment variables HTML for the try panel
   */
  generateEnvironmentHTML(envConfig?: EnvironmentConfig): string {
    const resolved = this.getResolvedEnvironmentConfig(envConfig);
    
    if (!resolved.variables.length && !Object.keys(resolved.headers).length) {
      return '';
    }

    const variablesHTML = resolved.variables.map(variable => {
      const inputType = variable.sensitive ? 'password' : 'text';
      const icon = this.getVariableIcon(variable.type);
      
      return `
        <div class="env-variable">
          <div class="env-icon">${icon}</div>
          <div class="env-description">
            ${variable.name}
            ${variable.description ? `<span class="text-xs text-gray-500 ml-1">(${variable.description})</span>` : ''}
          </div>
          <input 
            type="${inputType}" 
            id="env-${variable.name}"
            class="env-input"
            placeholder="Enter ${variable.name}"
            value="${variable.value || ''}"
            data-variable-name="${variable.name}"
            data-variable-type="${variable.type || 'custom'}"
          />
        </div>
      `;
    }).join('');

    const headersHTML = Object.keys(resolved.headers).length > 0 ? `
      <div class="default-headers">
        <h4 class="default-headers-title">Default Headers</h4>
        ${Object.entries(resolved.headers).map(([key, value]) => `
          <div class="header-item">
            <span class="font-mono">${key}:</span>
            <span class="font-mono">${value}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="environment-section">
        <h3 class="environment-title">Environment Variables</h3>
        ${variablesHTML}
        ${headersHTML}
        <div class="action-buttons">
          <button 
            id="apply-env-vars" 
            class="action-button apply-button"
          >
            Apply Variables
          </button>
          <button 
            id="clear-env-vars" 
            class="action-button clear-button"
          >
            Clear All
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Generate JavaScript for environment variable functionality
   */
  generateEnvironmentJS(): string {
    return `
      // Environment Variables Management
      function initializeEnvironmentVariables() {
        const applyBtn = document.getElementById('apply-env-vars');
        const clearBtn = document.getElementById('clear-env-vars');
        
        if (applyBtn) {
          applyBtn.addEventListener('click', applyEnvironmentVariables);
        }
        
        if (clearBtn) {
          clearBtn.addEventListener('click', clearEnvironmentVariables);
        }
        
        // Load saved variables from localStorage
        loadSavedEnvironmentVariables();
        
        // Auto-save variables on change
        document.querySelectorAll('[data-variable-name]').forEach(input => {
          input.addEventListener('input', saveEnvironmentVariable);
        });
      }
      
      function applyEnvironmentVariables() {
        const variables = {};
        const headers = {};
        
        document.querySelectorAll('[data-variable-name]').forEach(input => {
          const name = input.dataset.variableName;
          const type = input.dataset.variableType;
          const value = input.value;
          
          if (value) {
            variables[name] = value;
            
            // Apply to headers based on type
            if (type === 'token') {
              if (name === 'accessToken' || name === 'bearerToken') {
                headers['Authorization'] = 'Bearer ' + value;
              } else if (name === 'apiKey') {
                headers['X-API-Key'] = value;
              } else {
                headers['X-' + name] = value;
              }
            }
          }
        });
        
        // Store in global scope for try panel usage
        window.zedocEnvironment = { variables, headers };
        
        // Show success message
        showEnvironmentMessage('Environment variables applied successfully!', 'success');
        
        console.log('Zedoc Environment Variables Applied:', window.zedocEnvironment);
      }
      
      function clearEnvironmentVariables() {
        document.querySelectorAll('[data-variable-name]').forEach(input => {
          input.value = '';
        });
        
        // Clear from localStorage
        localStorage.removeItem('zedoc-environment-variables');
        
        // Clear global scope
        window.zedocEnvironment = { variables: {}, headers: {} };
        
        showEnvironmentMessage('Environment variables cleared!', 'info');
      }
      
      function saveEnvironmentVariable(event) {
        const input = event.target;
        const name = input.dataset.variableName;
        const value = input.value;
        
        // Get existing saved variables
        const saved = JSON.parse(localStorage.getItem('zedoc-environment-variables') || '{}');
        saved[name] = value;
        
        // Save to localStorage
        localStorage.setItem('zedoc-environment-variables', JSON.stringify(saved));
      }
      
      function loadSavedEnvironmentVariables() {
        const saved = JSON.parse(localStorage.getItem('zedoc-environment-variables') || '{}');
        
        Object.entries(saved).forEach(([name, value]) => {
          const input = document.getElementById('env-' + name);
          if (input) {
            input.value = value;
          }
        });
        
        // Auto-apply if variables exist
        if (Object.keys(saved).length > 0) {
          setTimeout(applyEnvironmentVariables, 100);
        }
      }
      
      function showEnvironmentMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('env-message');
        if (!messageEl) {
          messageEl = document.createElement('div');
          messageEl.id = 'env-message';
          messageEl.className = 'fixed top-4 right-4 px-4 py-2 rounded-md text-sm font-medium z-50 transition-all duration-300';
          document.body.appendChild(messageEl);
        }
        
        // Set message and style based on type
        messageEl.textContent = message;
        messageEl.className = messageEl.className.replace(/bg-\\w+-\\d+/g, '');
        
        if (type === 'success') {
          messageEl.classList.add('bg-green-500', 'text-white');
        } else if (type === 'error') {
          messageEl.classList.add('bg-red-500', 'text-white');
        } else {
          messageEl.classList.add('bg-blue-500', 'text-white');
        }
        
        // Show and auto-hide
        messageEl.style.opacity = '1';
        setTimeout(() => {
          messageEl.style.opacity = '0';
        }, 3000);
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnvironmentVariables);
      } else {
        initializeEnvironmentVariables();
      }
    `;
  }

  /**
   * Get icon for variable type
   */
  private getVariableIcon(type?: string): string {
    switch (type) {
      case 'token':
        return '🔑';
      case 'header':
        return '📋';
      case 'query':
        return '🔍';
      case 'body':
        return '📄';
      default:
        return '⚙️';
    }
  }

  /**
   * Get available environment variable types
   */
  getAvailableVariableTypes(): Array<{ key: string; name: string; description: string; icon: string }> {
    return [
      {
        key: 'token',
        name: 'Authentication Token',
        description: 'JWT tokens, API keys, bearer tokens',
        icon: '🔑'
      },
      {
        key: 'header',
        name: 'HTTP Header',
        description: 'Custom HTTP headers for requests',
        icon: '📋'
      },
      {
        key: 'query',
        name: 'Query Parameter',
        description: 'URL query parameters',
        icon: '🔍'
      },
      {
        key: 'body',
        name: 'Request Body',
        description: 'Request body parameters',
        icon: '📄'
      },
      {
        key: 'custom',
        name: 'Custom Variable',
        description: 'Custom environment variable',
        icon: '⚙️'
      }
    ];
  }
} 