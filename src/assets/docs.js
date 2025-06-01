// State management for caching
class StateManager {
  constructor() {
    this.storageKey = 'api-docs-state';
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultState();
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
      return this.getDefaultState();
    }
  }

  getDefaultState() {
    return {
      expandedSections: [],
      scrollPosition: 0,
      apiPanel: {
        isOpen: false,
        currentEndpoint: null,
        method: 'GET',
        url: '',
        headers: [],
        queryParams: [],
        requestBody: '',
        lastResponse: null,
      },
      search: {
        query: '',
        activeRole: 'all',
      },
      theme: 'light',
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  updateState(path, value) {
    const keys = path.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.saveState();
  }

  getState(path) {
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  clearState() {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

// Theme management
class ThemeManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.theme = this.stateManager.getState('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme();
    this.bindEvents();
  }

  applyTheme() {
    document.body.className = this.theme;
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      const icon = this.theme === 'light' ? '🌙' : '☀️';
      themeToggle.innerHTML = icon;
      themeToggle.title = this.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.stateManager.updateState('theme', this.theme);
    this.applyTheme();
  }

  bindEvents() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// Navigation management
class NavigationManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateActiveNavItem();
    this.restoreScrollPosition();
  }

  bindEvents() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-item').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          // Update active nav item
          this.setActiveNavItem(link);
        }
      });
    });

    // Create mobile overlay
    this.createMobileOverlay();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu when clicking outside or on nav items
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      const overlay = document.querySelector('.mobile-overlay');

      if (
        sidebar &&
        mobileMenuBtn &&
        !sidebar.contains(e.target) &&
        !mobileMenuBtn.contains(e.target) &&
        (overlay && e.target === overlay)
      ) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when clicking on nav items
    document.querySelectorAll('.nav-item').forEach((navItem) => {
      navItem.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Update active nav item on scroll and save scroll position
    window.addEventListener('scroll', () => {
      this.updateActiveNavItem();
      this.saveScrollPosition();
    });
  }

  setActiveNavItem(activeLink) {
    document.querySelectorAll('.nav-item').forEach((link) => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  updateActiveNavItem() {
    const sections = document.querySelectorAll('.module-section, .section');
    const navItems = document.querySelectorAll('.nav-item');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section.id;
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSection}`) {
        item.classList.add('active');
      }
    });
  }

  saveScrollPosition() {
    this.stateManager.updateState('scrollPosition', window.scrollY);
  }

  restoreScrollPosition() {
    const scrollPosition = this.stateManager.getState('scrollPosition');
    if (scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  }

  createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;
    overlay.addEventListener('click', () => {
      this.closeMobileMenu();
    });
    document.body.appendChild(overlay);
  }

  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar && overlay) {
      const isOpen = sidebar.classList.contains('open');
      
      if (isOpen) {
        this.closeMobileMenu();
      } else {
        sidebar.classList.add('open');
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
      }
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }
  }
}

// Endpoint card management
class EndpointManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.init();
  }

  init() {
    this.bindEvents();
    this.restoreExpandedSections();
  }

  bindEvents() {
    document.querySelectorAll('.endpoint-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't expand if clicking on try button
        if (e.target.classList.contains('try-button')) {
          return;
        }
        
        const details = header.nextElementSibling;
        const isExpanded = details.classList.contains('expanded');
        
        // Toggle current details
        details.classList.toggle('expanded', !isExpanded);
        
        // Save expanded state
        this.saveExpandedSections();
      });
    });
  }

  saveExpandedSections() {
    const expandedSections = [];
    document.querySelectorAll('.endpoint-details.expanded').forEach((detail) => {
      const card = detail.closest('.endpoint-card');
      if (card) {
        const path = card.querySelector('.endpoint-path');
        const method = card.querySelector('.method-badge');
        if (path && method) {
          expandedSections.push({
            path: path.textContent.trim(),
            method: method.textContent.trim()
          });
        }
      }
    });
    this.stateManager.updateState('expandedSections', expandedSections);
  }

  restoreExpandedSections() {
    const expandedSections = this.stateManager.getState('expandedSections') || [];
    setTimeout(() => {
      expandedSections.forEach((section) => {
        const cards = document.querySelectorAll('.endpoint-card');
        cards.forEach((card) => {
          const path = card.querySelector('.endpoint-path');
          const method = card.querySelector('.method-badge');
          if (path && method && 
              path.textContent.trim() === section.path &&
              method.textContent.trim() === section.method) {
            const details = card.querySelector('.endpoint-details');
            if (details) {
              details.classList.add('expanded');
            }
          }
        });
      });
    }, 100);
  }
}

// Search functionality
class SearchManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.init();
  }

  init() {
    this.bindEvents();
    this.restoreSearchState();
  }

  bindEvents() {
    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.stateManager.updateState('search.query', e.target.value);
        this.filterEndpoints(e.target.value, this.getActiveRole());
      });
    }

    // Role filter buttons
    document.querySelectorAll('.role-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // Update active button
        document
          .querySelectorAll('.role-btn')
          .forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Save role state and filter endpoints
        this.stateManager.updateState('search.activeRole', e.target.dataset.role);
        const searchInput = document.querySelector('.search-input');
        const searchQuery = searchInput ? searchInput.value : '';
        this.filterEndpoints(searchQuery, e.target.dataset.role);
      });
    });
  }

  getActiveRole() {
    const activeBtn = document.querySelector('.role-btn.active');
    return activeBtn ? activeBtn.dataset.role : 'all';
  }

  filterEndpoints(query, role = 'all') {
    const endpoints = document.querySelectorAll('.endpoint-card');
    const modules = document.querySelectorAll('.module-section');
    const sections = document.querySelectorAll('.section');
    
    query = query.toLowerCase();
    
    endpoints.forEach((endpoint) => {
      const pathElement = endpoint.querySelector('.endpoint-path');
      const summaryElement = endpoint.querySelector('.endpoint-summary');
      const methodElement = endpoint.querySelector('.method-badge');
      const tagsData = endpoint.dataset.tags || '';
      
      const path = pathElement ? pathElement.textContent.toLowerCase() : '';
      const summary = summaryElement ? summaryElement.textContent.toLowerCase() : '';
      const method = methodElement ? methodElement.textContent.toLowerCase() : '';
      const tags = tagsData.toLowerCase();
      
      // Check if endpoint matches search query
      const matchesQuery = !query || 
        path.includes(query) || 
        summary.includes(query) || 
        method.includes(query) ||
        tags.includes(query);
      
      // Check if endpoint matches role filter
      const matchesRole = role === 'all' || tags.includes(role.toLowerCase());
      
      endpoint.style.display = matchesQuery && matchesRole ? 'block' : 'none';
    });
    
    // Hide modules with no visible endpoints
    modules.forEach((module) => {
      const visibleEndpoints = module.querySelectorAll(
        '.endpoint-card[style="display: block"], .endpoint-card:not([style*="display: none"])',
      );
      module.style.display = visibleEndpoints.length > 0 ? 'block' : 'none';
    });

    // Hide sections with no visible modules
    sections.forEach((section) => {
      const visibleModules = section.querySelectorAll(
        '.module-section[style="display: block"], .module-section:not([style*="display: none"])',
      );
      section.style.display = visibleModules.length > 0 ? 'block' : 'none';
    });
  }

  restoreSearchState() {
    setTimeout(() => {
      const searchQuery = this.stateManager.getState('search.query') || '';
      const activeRole = this.stateManager.getState('search.activeRole') || 'all';
      
      // Restore search input value
      const searchInput = document.querySelector('.search-input');
      if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
      }
      
      // Restore active role button
      document.querySelectorAll('.role-btn').forEach((btn) => {
        btn.classList.remove('active');
        if (btn.dataset.role === activeRole) {
          btn.classList.add('active');
        }
      });
      
      // Apply filters
      this.filterEndpoints(searchQuery, activeRole);
    }, 200);
  }
}

// Copy to clipboard functionality
class ClipboardManager {
  constructor() {
    this.init();
  }

  init() {
    this.addCopyButtons();
  }

  addCopyButtons() {
    document.querySelectorAll('.code-block').forEach(codeBlock => {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋';
      copyBtn.title = 'Copy to clipboard';
      copyBtn.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(0, 0, 0, 0.1);
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      `;
      
      const container = document.createElement('div');
      container.style.position = 'relative';
      
      codeBlock.parentNode.insertBefore(container, codeBlock);
      container.appendChild(codeBlock);
      container.appendChild(copyBtn);
      
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard(codeBlock.textContent, copyBtn);
      });

      copyBtn.addEventListener('mouseenter', () => {
        copyBtn.style.opacity = '1';
      });

      copyBtn.addEventListener('mouseleave', () => {
        copyBtn.style.opacity = '0.7';
      });
    });
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      button.innerHTML = '✅';
      setTimeout(() => {
        button.innerHTML = '📋';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      button.innerHTML = '❌';
      setTimeout(() => {
        button.innerHTML = '📋';
      }, 2000);
    }
  }
}

// Initialize all functionality when DOM is ready
if (document.readyState === 'loading') {
  // DOM hasn't finished loading yet
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready, initialize immediately
  initializeApp();
}

function initializeApp() {
  // Create state manager instance
  const stateManager = new StateManager();
  
  // Initialize all managers
  const themeManager = new ThemeManager(stateManager);
  const navigationManager = new NavigationManager(stateManager);
  const endpointManager = new EndpointManager(stateManager);
  const searchManager = new SearchManager(stateManager);
  const clipboardManager = new ClipboardManager();
  const apiTesterManager = new ApiTesterManager(stateManager);
  
  // Make API tester manager globally available for environment variable sync
  window.apiTesterManager = apiTesterManager;
  
  console.log('📄 All documentation features initialized successfully');
}

// API Testing functionality (simplified version)
class ApiTesterManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.panel = null;
    this.currentEndpoint = null;
    this.environmentVariables = [];
    this.init();
  }

  init() {
    this.panel = document.getElementById('apiPanel');
    this.bindEvents();
    this.restorePanelState();
    this.loadEnvironmentVariables();
  }

  loadEnvironmentVariables() {
    try {
      const stored = localStorage.getItem('api-docs-env-vars');
      if (stored) {
        this.environmentVariables = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load environment variables for API tester:', e);
      this.environmentVariables = [];
    }
  }

  // Method to refresh environment variables (can be called from outside)
  refreshEnvironmentVariables() {
    this.loadEnvironmentVariables();
  }

  bindEvents() {
    // Try buttons
    document.querySelectorAll('.try-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPanel(button);
      });
    });

    // Close panel button
    const closePanelBtn = document.getElementById('closePanelBtn');
    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', () => {
        this.closePanel();
      });
    }

    // Send request button
    const sendRequestBtn = document.getElementById('sendRequestBtn');
    if (sendRequestBtn) {
      sendRequestBtn.addEventListener('click', () => {
        this.sendRequest();
      });
    }

    // Add header button
    const addHeaderBtn = document.getElementById('addHeaderBtn');
    if (addHeaderBtn) {
      addHeaderBtn.addEventListener('click', () => {
        this.addHeaderRow();
      });
    }

    // Add query parameter button
    const addQueryBtn = document.getElementById('addQueryBtn');
    if (addQueryBtn) {
      addQueryBtn.addEventListener('click', () => {
        this.addQueryRow();
      });
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.panel && this.panel.classList.contains('open') && 
          !this.panel.contains(e.target) && 
          !e.target.classList.contains('try-button')) {
        this.closePanel();
      }
    });

    // Escape key to close panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel && this.panel.classList.contains('open')) {
        this.closePanel();
      }
    });
  }

  openPanel(button) {
    const method = button.dataset.method.toUpperCase();
    const path = button.dataset.path;
    const endpointId = button.dataset.endpointId;
    
    // Store current endpoint reference
    this.currentEndpoint = { method, path, endpointId };
    
    // Update panel title with endpoint info
    this.updatePanelTitle(method, path);
    
    // Populate panel with endpoint data from DOM
    this.populatePanel(method, path, endpointId);
    
    // Show panel
    this.panel.classList.add('open');
    this.panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 600px;
      height: 100vh;
      background: var(--light-bg);
      border-left: 1px solid var(--light-border);
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
      z-index: 2000;
      overflow-y: auto;
      padding: 1.5rem;
    `;
    
    // Save panel state
    this.savePanelState();
  }

  closePanel() {
    this.panel.classList.remove('open');
    this.panel.style.right = '-600px';
    
    // Save closed state
    this.stateManager.updateState('apiPanel.isOpen', false);
  }

  updatePanelTitle(method, path) {
    const subtitle = document.getElementById('apiPanelSubtitle');
    if (subtitle) {
      subtitle.innerHTML = `<span style="background: var(--light-method-${method.toLowerCase()}); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.5rem;">${method}</span> ${path}`;
    }
  }

  populatePanel(method, path, endpointId) {
    // Set method
    const methodSelect = document.getElementById('requestMethod');
    if (methodSelect) {
      methodSelect.value = method;
    }

    // Set URL with BASE_URL variable for replacement
    const urlInput = document.getElementById('requestUrl');
    if (urlInput) {
      const fullUrl = `{BASE_URL}${path}`;
      urlInput.value = this.replaceUrlVariables(fullUrl);
    }

    // Find endpoint data from DOM
    const endpointData = this.extractEndpointDataFromDOM(endpointId);
    
    // Populate headers table
    this.populateHeadersTable(endpointData.headers);
    
    // Always populate query parameters table (for all methods)
    this.populateQueryTable(endpointData.parameters);
    
    // Pre-fill request body
    this.populateRequestBody(endpointData.requestBody);

    // Show/hide sections based on method, but always show parameters
    const querySection = document.getElementById('querySection');
    const bodySection = document.querySelector('.body-section');
    
    if (querySection && bodySection) {
      // Always show query parameters section
      querySection.style.display = 'block';
      
      if (method === 'GET' || method === 'DELETE') {
        bodySection.style.display = 'none';
      } else {
        bodySection.style.display = 'block';
      }
    }
  }

  extractEndpointDataFromDOM(endpointId) {
    // Find the endpoint section in the DOM
    const endpointSection = document.getElementById(endpointId);
    if (!endpointSection) {
      return { headers: [], parameters: [], requestBody: null };
    }

    const data = { headers: [], parameters: [], requestBody: null };

    // Extract request headers from detail sections
    const detailSections = endpointSection.querySelectorAll('.detail-section');
    detailSections.forEach(section => {
      const title = section.querySelector('.detail-title');
      if (title && title.textContent.includes('Request Headers')) {
        const codeBlock = section.querySelector('.code-block');
        if (codeBlock) {
          try {
            const headersText = codeBlock.textContent.trim();
            if (headersText) {
              const headersObj = JSON.parse(headersText);
              data.headers = Object.entries(headersObj).map(([key, value]) => ({ key, value }));
            }
          } catch (e) {
            console.warn('Failed to parse request headers:', e);
          }
        }
      }
      
      if (title && title.textContent.includes('Request Body')) {
        const codeBlock = section.querySelector('.code-block');
        if (codeBlock) {
          try {
            const bodyText = codeBlock.textContent.trim();
            if (bodyText) {
              data.requestBody = JSON.parse(bodyText);
            }
          } catch (e) {
            // If it's not valid JSON, keep as string
            data.requestBody = codeBlock.textContent.trim();
          }
        }
      }
    });

    // Extract parameters from table
    const paramsTable = endpointSection.querySelector('.params-table tbody');
    if (paramsTable) {
      const rows = paramsTable.querySelectorAll('tr');
      data.parameters = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          return {
            name: cells[0].textContent.trim(),
            type: cells[1].textContent.trim(),
            in: cells[2].textContent.trim(),
            required: cells[3].textContent.trim() === 'Yes',
            description: cells[4].textContent.trim()
          };
        }
        return null;
      }).filter(Boolean);
    }

    return data;
  }

  populateHeadersTable(headers = []) {
    const headersForm = document.getElementById('headersForm');
    if (!headersForm) return;

    // Clear existing headers
    headersForm.innerHTML = '';

    // Add default headers if any exist in the endpoint
    headers.forEach(header => {
      this.addHeaderRow(header.key, this.replaceDoubleVariables(header.value));
    });

    // Add common default headers if none exist
    if (headers.length === 0) {
      this.addHeaderRow('Content-Type', 'application/json');
      this.addHeaderRow('Authorization', '{{API_TOKEN}}');
    }
  }

  populateQueryTable(parameters = []) {
    const queryForm = document.getElementById('queryForm');
    if (!queryForm) return;

    // Clear existing parameters
    queryForm.innerHTML = '';

    // Add all parameters (query, path, header parameters)
    parameters.forEach(param => {
      let defaultValue = '';
      
      // For path parameters, suggest variable replacement
      if (param.in === 'path') {
        defaultValue = `{${param.name}}`;
      } 
      // For query parameters, suggest environment variable
      else if (param.in === 'query') {
        defaultValue = param.required ? '' : `{{${param.name.toUpperCase()}}}`;
      }
      // For header parameters, suggest environment variable
      else if (param.in === 'header') {
        defaultValue = `{{${param.name.toUpperCase()}}}`;
      }
      
      this.addQueryRow(param.name, defaultValue, `${param.description || ''} (${param.in} parameter)`, param.in);
    });

    // If no parameters exist, add a default example
    if (parameters.length === 0) {
      this.addQueryRow('', '', 'Add query parameters here', 'query');
    }
  }

  populateRequestBody(requestBody) {
    const bodyTextarea = document.getElementById('requestBody');
    if (!bodyTextarea) return;

    if (requestBody) {
      let bodyText;
      if (typeof requestBody === 'object') {
        bodyText = JSON.stringify(requestBody, null, 2);
      } else {
        bodyText = requestBody;
      }
      
      // Apply variable replacement for double brackets
      bodyText = this.replaceDoubleVariables(bodyText);
      bodyTextarea.value = bodyText;
    } else {
      bodyTextarea.value = '';
    }
  }

  addHeaderRow(key = '', value = '', description = '') {
    const headersForm = document.getElementById('headersForm');
    if (!headersForm) return;

    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    headerRow.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    `;

    headerRow.innerHTML = `
      <input type="text" class="header-key" placeholder="Header Name" value="${this.escapeHtml(key)}" style="padding: 0.5rem; border: 1px solid var(--light-border); border-radius: 4px; font-size: 0.75rem;">
      <input type="text" class="header-value" placeholder="Header Value" value="${this.escapeHtml(value)}" style="padding: 0.5rem; border: 1px solid var(--light-border); border-radius: 4px; font-size: 0.75rem; font-family: 'Fira Code', monospace;">
      <button type="button" class="remove-header-btn" style="padding: 0.5rem; border: none; background: none; cursor: pointer; color: #ef4444; font-size: 0.875rem;" title="Remove Header">🗑️</button>
    `;

    // Add remove functionality
    headerRow.querySelector('.remove-header-btn').addEventListener('click', () => {
      headerRow.remove();
    });

    headersForm.appendChild(headerRow);
  }

  addQueryRow(key = '', value = '', description = '', paramType = 'query') {
    const queryForm = document.getElementById('queryForm');
    if (!queryForm) return;

    const queryRow = document.createElement('div');
    queryRow.className = 'query-row';
    queryRow.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr 2fr auto;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    `;

    queryRow.innerHTML = `
      <input type="text" class="query-key" placeholder="Parameter Name" value="${this.escapeHtml(key)}" style="padding: 0.5rem; border: 1px solid var(--light-border); border-radius: 4px; font-size: 0.75rem;">
      <input type="text" class="query-value" placeholder="Parameter Value" value="${this.escapeHtml(value)}" style="padding: 0.5rem; border: 1px solid var(--light-border); border-radius: 4px; font-size: 0.75rem; font-family: 'Fira Code', monospace;" title="${this.escapeHtml(description)}">
      <input type="text" class="query-description" placeholder="Description" value="${this.escapeHtml(description)}" style="padding: 0.5rem; border: 1px solid var(--light-border); border-radius: 4px; font-size: 0.75rem;" readonly>
      <button type="button" class="remove-query-btn" style="padding: 0.5rem; border: none; background: none; cursor: pointer; color: #ef4444; font-size: 0.875rem;" title="Remove Parameter">🗑️</button>
    `;

    // Store parameter type as data attribute
    queryRow.setAttribute('data-param-type', paramType);

    // Add remove functionality
    queryRow.querySelector('.remove-query-btn').addEventListener('click', () => {
      queryRow.remove();
    });

    queryForm.appendChild(queryRow);
  }

  // Variable replacement for URLs (single brackets {})
  replaceUrlVariables(url) {
    return url.replace(/\{([^}]+)\}/g, (match, varName) => {
      const envVar = this.environmentVariables.find(v => v.key === varName);
      return envVar ? envVar.value : match;
    });
  }

  // Variable replacement for body/headers/params (double brackets {{}})
  replaceDoubleVariables(text) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const envVar = this.environmentVariables.find(v => v.key === varName);
      return envVar ? envVar.value : match;
    });
  }

  // Collect headers from the form
  collectHeaders() {
    const headers = {};
    const headerRows = document.querySelectorAll('.header-row');
    
    headerRows.forEach(row => {
      const keyInput = row.querySelector('.header-key');
      const valueInput = row.querySelector('.header-value');
      
      if (keyInput && valueInput && keyInput.value.trim() && valueInput.value.trim()) {
        const key = keyInput.value.trim();
        const value = this.replaceDoubleVariables(valueInput.value.trim());
        headers[key] = value;
      }
    });

    return headers;
  }

  // Collect query parameters from the form (only actual query parameters for URL)
  collectQueryParams() {
    const params = new URLSearchParams();
    const queryRows = document.querySelectorAll('.query-row');
    
    queryRows.forEach(row => {
      const paramType = row.getAttribute('data-param-type');
      
      // Only include actual query parameters in the URL
      if (paramType === 'query') {
        const keyInput = row.querySelector('.query-key');
        const valueInput = row.querySelector('.query-value');
        
        if (keyInput && valueInput && keyInput.value.trim() && valueInput.value.trim()) {
          const key = keyInput.value.trim();
          const value = this.replaceDoubleVariables(valueInput.value.trim());
          params.append(key, value);
        }
      }
    });

    return params;
  }

  async sendRequest() {
    const method = document.getElementById('requestMethod').value;
    let url = document.getElementById('requestUrl').value;
    const bodyText = document.getElementById('requestBody').value;

    // Apply URL variable replacement for path parameters and BASE_URL
    url = this.replaceUrlVariables(url);

    // Collect headers
    const headers = this.collectHeaders();

    // Collect query parameters and apply them to the URL
    const queryParams = this.collectQueryParams();
    if (queryParams.toString()) {
      const separator = url.includes('?') ? '&' : '?';
      url += separator + queryParams.toString();
    }

    // Show loading state
    const sendButton = document.getElementById('sendRequestBtn');
    const originalText = sendButton.textContent;
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;

    try {
      const requestOptions = {
        method: method,
        headers: headers
      };

      // Add body for non-GET requests
      if (method !== 'GET' && method !== 'DELETE' && bodyText.trim()) {
        let processedBody = this.replaceDoubleVariables(bodyText);
        
        // If it looks like JSON, validate it
        if (processedBody.trim().startsWith('{') || processedBody.trim().startsWith('[')) {
          try {
            JSON.parse(processedBody); // Validate JSON
            requestOptions.body = processedBody;
          } catch (e) {
            this.showError('Invalid JSON in request body after variable replacement');
            return;
          }
        } else {
          requestOptions.body = processedBody;
        }
      }

      const startTime = Date.now();
      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      
      // Get response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      const responseText = await response.text();
      let responseBody = responseText;
      
      // Try to parse as JSON for pretty formatting
      try {
        const jsonResponse = JSON.parse(responseText);
        responseBody = JSON.stringify(jsonResponse, null, 2);
      } catch (e) {
        // Keep as text if not valid JSON
      }

      // Display response
      this.displayResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: endTime - startTime
      });

    } catch (error) {
      this.displayError(error);
    } finally {
      // Reset button
      sendButton.textContent = originalText;
      sendButton.disabled = false;
    }
  }

  displayResponse(response) {
    // Status
    const statusDisplay = document.getElementById('responseStatus');
    statusDisplay.textContent = `${response.status} ${response.statusText} (${response.time}ms)`;
    statusDisplay.className = 'status-display';
    
    if (response.status >= 200 && response.status < 300) {
      statusDisplay.style.color = '#10b981';
    } else {
      statusDisplay.style.color = '#ef4444';
    }

    // Headers
    const headersTextarea = document.getElementById('responseHeaders');
    headersTextarea.value = JSON.stringify(response.headers, null, 2);

    // Body
    const bodyTextarea = document.getElementById('responseBody');
    bodyTextarea.value = response.body;

    // Store response for export and save to state
    this.lastResponse = response;
    this.stateManager.updateState('apiPanel.lastResponse', response);
  }

  displayError(error) {
    const statusDisplay = document.getElementById('responseStatus');
    statusDisplay.textContent = `Error: ${error.message}`;
    statusDisplay.style.color = '#ef4444';

    const bodyTextarea = document.getElementById('responseBody');
    bodyTextarea.value = `Error: ${error.message}\n\nThis could be due to:\n- CORS policy\n- Network connectivity\n- Invalid URL\n- Server error`;

    // Clear headers
    const headersTextarea = document.getElementById('responseHeaders');
    headersTextarea.value = '';

    this.lastResponse = null;
  }

  showError(message) {
    alert(message);
  }

  savePanelState() {
    const panelState = {
      isOpen: this.panel.classList.contains('open'),
      method: document.getElementById('requestMethod')?.value || 'GET',
      url: document.getElementById('requestUrl')?.value || '',
      requestBody: document.getElementById('requestBody')?.value || '',
      currentEndpoint: this.currentEndpoint
    };
    
    this.stateManager.updateState('apiPanel', panelState);
  }

  restorePanelState() {
    setTimeout(() => {
      const panelState = this.stateManager.getState('apiPanel');
      if (!panelState || !panelState.isOpen) return;
      
      // Restore panel open state
      this.panel.classList.add('open');
      this.panel.style.right = '0';
      
      // Restore form values
      const methodSelect = document.getElementById('requestMethod');
      if (methodSelect && panelState.method) {
        methodSelect.value = panelState.method;
      }
      
      const urlInput = document.getElementById('requestUrl');
      if (urlInput && panelState.url) {
        urlInput.value = panelState.url;
      }
      
      const bodyTextarea = document.getElementById('requestBody');
      if (bodyTextarea && panelState.requestBody) {
        bodyTextarea.value = panelState.requestBody;
      }
      
      // Restore last response if available
      const lastResponse = this.stateManager.getState('apiPanel.lastResponse');
      if (lastResponse) {
        this.lastResponse = lastResponse;
        this.displayResponse(lastResponse);
      }
    }, 300);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}