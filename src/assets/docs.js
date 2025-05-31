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
  
  console.log('📄 All documentation features initialized successfully');
}

// API Testing functionality (simplified version)
class ApiTesterManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.panel = null;
    this.currentEndpoint = null;
    this.init();
  }

  init() {
    this.panel = document.getElementById('apiPanel');
    this.bindEvents();
    this.restorePanelState();
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
    
    // Update panel title with endpoint info
    this.updatePanelTitle(method, path);
    
    // Populate panel with endpoint data
    this.populatePanel(method, path);
    
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

  populatePanel(method, path) {
    // Set method
    const methodSelect = document.getElementById('requestMethod');
    if (methodSelect) {
      methodSelect.value = method;
    }

    // Set URL
    const urlInput = document.getElementById('requestUrl');
    if (urlInput) {
      const baseUrl = window.location.origin;
      urlInput.value = `${baseUrl}${path}`;
    }

    // Show/hide query section based on method
    const querySection = document.getElementById('querySection');
    const bodySection = document.querySelector('.body-section');
    
    if (querySection && bodySection) {
      if (method === 'GET') {
        querySection.style.display = 'block';
        bodySection.style.display = 'none';
      } else {
        querySection.style.display = 'none';
        bodySection.style.display = 'block';
      }
    }
  }

  async sendRequest() {
    const method = document.getElementById('requestMethod').value;
    const url = document.getElementById('requestUrl').value;
    const bodyText = document.getElementById('requestBody').value;

    // Show loading state
    const sendButton = document.getElementById('sendRequestBtn');
    const originalText = sendButton.textContent;
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;

    try {
      const requestOptions = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add body for non-GET requests
      if (method !== 'GET' && bodyText.trim()) {
        try {
          JSON.parse(bodyText); // Validate JSON
          requestOptions.body = bodyText;
        } catch (e) {
          this.showError('Invalid JSON in request body');
          return;
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
} 