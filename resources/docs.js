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
    const sections = document.querySelectorAll('.module-section');
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
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
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
      header.addEventListener('click', () => {
        const details = header.nextElementSibling;
        const isExpanded = details.classList.contains('expanded');
        
        // Close all other expanded details
        document
          .querySelectorAll('.endpoint-details.expanded')
          .forEach((detail) => {
            if (detail !== details) {
              detail.classList.remove('expanded');
            }
          });
        
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
    this.createSearchInput();
    this.bindEvents();
    this.restoreSearchState();
  }

  createSearchInput() {
    const sidebar = document.querySelector('.sidebar');
    const subtitle = document.querySelector('.subtitle');
    
    if (sidebar && subtitle) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      searchContainer.innerHTML = `
        <input type="text" class="search-input" placeholder="Search endpoints..." />
        <div class="role-filter">
          <label class="role-filter-label">Filter by role:</label>
          <div class="role-buttons">
            <button class="role-btn active" data-role="all">All</button>
            <button class="role-btn" data-role="admin">Admin</button>
            <button class="role-btn" data-role="organizer">Organizer</button>
            <button class="role-btn" data-role="client">Client</button>
          </div>
        </div>
      `;
      
      subtitle.parentNode.insertBefore(searchContainer, subtitle.nextSibling);
    }
  }

  bindEvents() {
    // Wait for DOM to be ready and search input to be created
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.stateManager.updateState('search.query', e.target.value);
          this.filterEndpoints(e.target.value, this.getActiveRole());
        });
      }
    }, 100);

    // Role filter buttons - also wait for DOM
    setTimeout(() => {
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
    }, 100);
  }

  getActiveRole() {
    const activeBtn = document.querySelector('.role-btn.active');
    return activeBtn ? activeBtn.dataset.role : 'all';
  }

  filterEndpoints(query, role = 'all') {
    const endpoints = document.querySelectorAll('.endpoint-card');
    const modules = document.querySelectorAll('.module-section');
    
    query = query.toLowerCase();
    
    endpoints.forEach((endpoint) => {
      const pathElement = endpoint.querySelector('.endpoint-path');
      const summaryElement = endpoint.querySelector('.endpoint-summary');
      const methodElement = endpoint.querySelector('.method-badge');
      
      const path = pathElement ? pathElement.textContent.toLowerCase() : '';
      const summary = summaryElement ? summaryElement.textContent.toLowerCase() : '';
      const method = methodElement ? methodElement.textContent.toLowerCase() : '';
      
      // Check if endpoint matches search query
      const matchesQuery = !query || 
        path.includes(query) || 
        summary.includes(query) || 
        method.includes(query);
      
      // Check if endpoint matches role filter
      const matchesRole = this.checkRoleMatch(endpoint, role);
      
      endpoint.style.display = matchesQuery && matchesRole ? 'block' : 'none';
    });
    
    // Hide modules with no visible endpoints
    modules.forEach((module) => {
      const visibleEndpoints = module.querySelectorAll(
        '.endpoint-card[style="display: block"], .endpoint-card:not([style*="display: none"])',
      );
      module.style.display = visibleEndpoints.length > 0 ? 'block' : 'none';
    });
  }

  checkRoleMatch(endpoint, role) {
    if (role === 'all') return true;
    
    // Get the roles and authentication info from the endpoint details
    let rolesText = '';
    let isPublic = false;
    let requiresAuth = false;
    
    // Look for roles and authentication in the endpoint details
    const detailSections = endpoint.querySelectorAll('.detail-section');
    detailSections.forEach((section) => {
      const titleElement = section.querySelector('.detail-title');
      if (!titleElement) return;
      
      const title = titleElement.textContent.trim();
      
      if (title.includes('Required Roles')) {
        const rolesParagraph = section.querySelector('p');
        if (rolesParagraph) {
          rolesText = rolesParagraph.textContent.toLowerCase();
        }
      }
      
      if (title.includes('Authentication')) {
        const authParagraph = section.querySelector('p');
        if (authParagraph) {
          const authText = authParagraph.textContent;
          isPublic = authText.includes('Public Endpoint');
          requiresAuth = authText.includes('Authentication Required');
        }
      }
    });
    
    // Get endpoint path for additional context
    const pathElement = endpoint.querySelector('.endpoint-path');
    const path = pathElement ? pathElement.textContent.toLowerCase() : '';
    
    // Role matching logic
    switch (role) {
      case 'admin':
        // Admin can access everything, but specifically admin-only endpoints
        return (
          rolesText.includes('admin') ||
          path.includes('/admin') ||
          path.includes('/organizations') ||
          path.includes('/users')
        );
      case 'organizer':
        // Organizer can access organizer and admin endpoints, plus some user endpoints
        return (
          rolesText.includes('organizer') ||
          rolesText.includes('admin') ||
          rolesText.includes('temporary_token') ||
          path.includes('/tickets') ||
          path.includes('/bookings') ||
          path.includes('/events')
        );
      case 'client':
        // Client can access public endpoints, user endpoints, and booking-related endpoints
        return (
          isPublic ||
          rolesText.includes('user') ||
          rolesText.includes('no specific roles required') ||
          (!requiresAuth && !rolesText.includes('admin') && !rolesText.includes('organizer')) ||
          path.includes('/auth') ||
          path.includes('/bookings') ||
          path.includes('/tickets')
        );
      default:
        return true;
    }
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
      
      const container = document.createElement('div');
      container.className = 'code-container';
      container.style.position = 'relative';
      
      codeBlock.parentNode.insertBefore(container, codeBlock);
      container.appendChild(codeBlock);
      container.appendChild(copyBtn);
      
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard(codeBlock.textContent, copyBtn);
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

// API Testing functionality
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

    // Save state when form inputs change
    setTimeout(() => {
      const methodSelect = document.getElementById('requestMethod');
      const urlInput = document.getElementById('requestUrl');
      const bodyTextarea = document.getElementById('requestBody');

      if (methodSelect) {
        methodSelect.addEventListener('change', () => this.savePanelState());
      }
      if (urlInput) {
        urlInput.addEventListener('input', () => this.savePanelState());
      }
      if (bodyTextarea) {
        bodyTextarea.addEventListener('input', () => this.savePanelState());
      }
    }, 100);

    // Export response button
    const exportResponseBtn = document.getElementById('exportResponseBtn');
    if (exportResponseBtn) {
      exportResponseBtn.addEventListener('click', () => {
        this.exportResponse();
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
    const endpointCard = button.closest('.endpoint-card');
    
    // Extract endpoint data
    this.currentEndpoint = this.extractEndpointData(endpointCard, method, path);
    
    // Update panel title with endpoint info
    this.updatePanelTitle(method, path);
    
    // Show/hide query section based on method
    this.toggleQuerySection(method);
    
    // Populate panel with endpoint data
    this.populatePanel();
    
    // Show panel
    this.panel.classList.add('open');
    
    // Save panel state
    this.savePanelState();
    
    // Clear previous response
    this.clearResponse();
  }

  closePanel() {
    this.panel.classList.remove('open');
    // Reset subtitle when closing
    const subtitle = document.getElementById('apiPanelSubtitle');
    if (subtitle) {
      subtitle.textContent = 'Select an endpoint to test';
    }
    
    // Save closed state
    this.stateManager.updateState('apiPanel.isOpen', false);
  }

  updatePanelTitle(method, path) {
    const subtitle = document.getElementById('apiPanelSubtitle');
    if (subtitle) {
      subtitle.innerHTML = `<span class="method-badge-small method-${method.toLowerCase()}">${method}</span> ${path}`;
    }
  }

  toggleQuerySection(method) {
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

  extractEndpointData(endpointCard, method, path) {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/api/v1${path}`;
    
    // Extract headers from the endpoint details
    let headers = {
      'Content-Type': 'application/json'
    };
    
    // Extract request body example if available
    let requestBody = '';
    
    // Extract query parameters for GET requests
    let queryParams = {};
    
    // Look through all detail sections
    const detailSections = endpointCard.querySelectorAll('.detail-section');
    
    detailSections.forEach((section) => {
      const titleElement = section.querySelector('.detail-title');
      if (!titleElement) return;
      
      const title = titleElement.textContent.trim();
      
      // Extract request headers
      if (title.includes('Request Headers')) {
        const codeBlock = section.querySelector('.code-block pre code');
        if (codeBlock) {
          try {
            const headerData = JSON.parse(codeBlock.textContent);
            headers = { ...headers, ...headerData };
          } catch (e) {
            // If parsing fails, keep default headers
          }
        }
      }
      
      // Extract request body
      if (title.includes('Request Body')) {
        const codeBlock = section.querySelector('.code-block pre code');
        if (codeBlock) {
          requestBody = codeBlock.textContent;
        }
      }
      
      // Check authentication requirements
      if (title.includes('Authentication') && section.textContent.includes('Authentication Required')) {
        if (!headers['Authorization']) {
          headers['Authorization'] = 'Bearer your_token_here';
        }
      }
    });

    // Extract common query parameters for GET requests
    if (method === 'GET') {
      // Add common pagination and filtering parameters
      if (path.includes('/users') || path.includes('/tickets') || path.includes('/bookings')) {
        queryParams = {
          page: '1',
          limit: '10',
          sort: 'createdAt',
          order: 'desc'
        };
      }
      
      // Add search parameter for list endpoints
      if (path.includes('/search') || path.endsWith('s')) {
        queryParams.search = '';
      }
    }

    return {
      method,
      url: fullUrl,
      headers,
      body: requestBody,
      queryParams
    };
  }

  populatePanel() {
    // Set method
    const methodSelect = document.getElementById('requestMethod');
    if (methodSelect) {
      methodSelect.value = this.currentEndpoint.method;
    }

    // Set URL
    const urlInput = document.getElementById('requestUrl');
    if (urlInput) {
      urlInput.value = this.currentEndpoint.url;
    }

    // Set headers
    this.populateHeadersForm(this.currentEndpoint.headers);

    // Set query parameters for GET requests
    if (this.currentEndpoint.method === 'GET') {
      this.populateQueryForm(this.currentEndpoint.queryParams);
    }

    // Set request body
    const bodyTextarea = document.getElementById('requestBody');
    if (bodyTextarea) {
      bodyTextarea.value = this.currentEndpoint.body;
    }
  }

  async sendRequest() {
    const method = document.getElementById('requestMethod').value;
    let url = document.getElementById('requestUrl').value;
    const bodyText = document.getElementById('requestBody').value;

    // Collect headers from form
    const headers = this.collectHeadersFromForm();

    // For GET requests, append query parameters to URL
    if (method === 'GET') {
      const queryParams = this.collectQueryParamsFromForm();
      if (Object.keys(queryParams).length > 0) {
        const urlObj = new URL(url);
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value.trim()) {
            urlObj.searchParams.set(key, value);
          }
        });
        url = urlObj.toString();
      }
    }

    // Prepare request options
    const requestOptions = {
      method: method,
      headers: headers
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

    // Show loading state
    const sendButton = document.getElementById('sendRequestBtn');
    const originalText = sendButton.textContent;
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;

    try {
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
      statusDisplay.classList.add('success');
    } else {
      statusDisplay.classList.add('error');
    }

    // Headers
    const headersTextarea = document.getElementById('responseHeaders');
    headersTextarea.value = JSON.stringify(response.headers, null, 2);

    // Body
    const bodyTextarea = document.getElementById('responseBody');
    bodyTextarea.value = response.body;

    // Enable export button
    const exportButton = document.getElementById('exportResponseBtn');
    exportButton.disabled = false;

    // Store response for export and save to state
    this.lastResponse = response;
    this.stateManager.updateState('apiPanel.lastResponse', response);
  }

  displayError(error) {
    const statusDisplay = document.getElementById('responseStatus');
    statusDisplay.textContent = `Error: ${error.message}`;
    statusDisplay.className = 'status-display error';

    const bodyTextarea = document.getElementById('responseBody');
    bodyTextarea.value = `Error: ${error.message}\n\nThis could be due to:\n- CORS policy\n- Network connectivity\n- Invalid URL\n- Server error`;

    // Clear headers
    const headersTextarea = document.getElementById('responseHeaders');
    headersTextarea.value = '';

    // Disable export button
    const exportButton = document.getElementById('exportResponseBtn');
    exportButton.disabled = true;
  }

  showError(message) {
    // You could implement a toast notification here
    alert(message);
  }

  clearResponse() {
    const statusDisplay = document.getElementById('responseStatus');
    statusDisplay.textContent = '-';
    statusDisplay.className = 'status-display';

    const headersTextarea = document.getElementById('responseHeaders');
    headersTextarea.value = '';

    const bodyTextarea = document.getElementById('responseBody');
    bodyTextarea.value = '';

    const exportButton = document.getElementById('exportResponseBtn');
    exportButton.disabled = true;

    this.lastResponse = null;
  }

  exportResponse() {
    if (!this.lastResponse) return;

    const exportData = {
      request: {
        method: document.getElementById('requestMethod').value,
        url: document.getElementById('requestUrl').value,
        headers: this.collectHeadersFromForm(),
        body: document.getElementById('requestBody').value || null
      },
      response: {
        status: this.lastResponse.status,
        statusText: this.lastResponse.statusText,
        headers: this.lastResponse.headers,
        body: this.lastResponse.body,
        time: this.lastResponse.time
      },
      timestamp: new Date().toISOString()
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  populateHeadersForm(headers) {
    const headersForm = document.getElementById('headersForm');
    if (!headersForm) return;

    // Clear existing headers
    headersForm.innerHTML = '';

    // Add each header as a form row
    Object.entries(headers).forEach(([key, value]) => {
      this.addHeaderRow(key, value, true);
    });

    // If no headers, add an empty row
    if (Object.keys(headers).length === 0) {
      this.addHeaderRow('', '', false);
    }
  }

  populateQueryForm(queryParams) {
    const queryForm = document.getElementById('queryForm');
    if (!queryForm) return;

    // Clear existing query parameters
    queryForm.innerHTML = '';

    // Add each query parameter as a form row
    Object.entries(queryParams).forEach(([key, value]) => {
      this.addQueryRow(key, value, true);
    });

    // If no query parameters, add an empty row
    if (Object.keys(queryParams).length === 0) {
      this.addQueryRow('', '', false);
    }
  }

  addHeaderRow(key = '', value = '', enabled = true) {
    const headersForm = document.getElementById('headersForm');
    if (!headersForm) return;

    const headerRow = document.createElement('div');
    headerRow.className = `header-row ${enabled ? '' : 'disabled'}`;
    
    headerRow.innerHTML = `
      <input type="checkbox" class="header-checkbox" ${enabled ? 'checked' : ''}>
      <input type="text" class="header-key-input" placeholder="Header name" value="${key}">
      <input type="text" class="header-value-input" placeholder="Header value" value="${value}">
      <button type="button" class="remove-header-btn" title="Remove header">✕</button>
    `;

    // Add event listeners
    const checkbox = headerRow.querySelector('.header-checkbox');
    const removeBtn = headerRow.querySelector('.remove-header-btn');

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      headerRow.classList.toggle('disabled', !checkbox.checked);
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      headerRow.remove();
    });

    headersForm.appendChild(headerRow);
  }

  addQueryRow(key = '', value = '', enabled = true) {
    const queryForm = document.getElementById('queryForm');
    if (!queryForm) return;

    const queryRow = document.createElement('div');
    queryRow.className = `query-row ${enabled ? '' : 'disabled'}`;
    
    queryRow.innerHTML = `
      <input type="checkbox" class="query-checkbox" ${enabled ? 'checked' : ''}>
      <input type="text" class="query-key-input" placeholder="Parameter name" value="${key}">
      <input type="text" class="query-value-input" placeholder="Parameter value" value="${value}">
      <button type="button" class="remove-query-btn" title="Remove parameter">✕</button>
    `;

    // Add event listeners
    const checkbox = queryRow.querySelector('.query-checkbox');
    const removeBtn = queryRow.querySelector('.remove-query-btn');

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      queryRow.classList.toggle('disabled', !checkbox.checked);
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      queryRow.remove();
    });

    queryForm.appendChild(queryRow);
  }

  collectHeadersFromForm() {
    const headers = {};
    const headerRows = document.querySelectorAll('.header-row');

    headerRows.forEach((row) => {
      const checkbox = row.querySelector('.header-checkbox');
      const keyInput = row.querySelector('.header-key-input');
      const valueInput = row.querySelector('.header-value-input');

      if (checkbox.checked && keyInput.value.trim() && valueInput.value.trim()) {
        headers[keyInput.value.trim()] = valueInput.value.trim();
      }
    });

    return headers;
  }

  collectQueryParamsFromForm() {
    const queryParams = {};
    const queryRows = document.querySelectorAll('.query-row');

    queryRows.forEach((row) => {
      const checkbox = row.querySelector('.query-checkbox');
      const keyInput = row.querySelector('.query-key-input');
      const valueInput = row.querySelector('.query-value-input');

      if (checkbox.checked && keyInput.value.trim()) {
        queryParams[keyInput.value.trim()] = valueInput.value.trim();
      }
    });

    return queryParams;
  }

  savePanelState() {
    const panelState = {
      isOpen: this.panel.classList.contains('open'),
      method: document.getElementById('requestMethod')?.value || 'GET',
      url: document.getElementById('requestUrl')?.value || '',
      headers: this.collectHeadersFromForm(),
      queryParams: this.collectQueryParamsFromForm(),
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
      
      // Restore headers
      if (panelState.headers && Object.keys(panelState.headers).length > 0) {
        this.populateHeadersForm(panelState.headers);
      }
      
      // Restore query parameters
      if (panelState.queryParams && Object.keys(panelState.queryParams).length > 0) {
        this.populateQueryForm(panelState.queryParams);
      }
      
      // Show/hide query section based on method
      if (panelState.method) {
        this.toggleQuerySection(panelState.method);
      }
      
      // Update panel title if we have endpoint info
      if (panelState.currentEndpoint) {
        this.currentEndpoint = panelState.currentEndpoint;
        this.updatePanelTitle(panelState.method, panelState.currentEndpoint.url);
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

// Initialize all managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const stateManager = new StateManager();
  
  // Add clear state button
  const clearStateBtn = document.createElement('button');
  clearStateBtn.className = 'clear-state-btn';
  clearStateBtn.innerHTML = '🗑️ Clear State';
  clearStateBtn.title = 'Clear all saved state (expanded sections, scroll position, panel data)';
  clearStateBtn.addEventListener('click', () => {
    if (confirm('Clear all saved state? This will reset expanded sections, scroll position, and panel data.')) {
      stateManager.clearState();
      location.reload();
    }
  });
  document.body.appendChild(clearStateBtn);
  
  new ThemeManager(stateManager);
  new NavigationManager(stateManager);
  new EndpointManager(stateManager);
  new SearchManager(stateManager);
  new ClipboardManager();
  new ApiTesterManager(stateManager);
});

// Add additional CSS for search and copy functionality
const additionalStyles = `
  .search-container {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid;
  }

  body.light .search-container {
    border-bottom-color: var(--light-border);
  }

  body.dark .search-container {
    border-bottom-color: var(--dark-border);
  }

  .search-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid;
    border-radius: 6px;
    background: transparent;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
  }

  body.light .search-input {
    border-color: var(--light-border);
    color: var(--light-text);
  }

  body.light .search-input:focus {
    outline: none;
    border-color: var(--light-orange);
  }

  body.dark .search-input {
    border-color: var(--dark-border);
    color: var(--dark-text);
  }

  body.dark .search-input:focus {
    outline: none;
    border-color: var(--dark-orange);
  }

  .role-filter {
    margin-top: 1rem;
  }

  .role-filter-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    opacity: 0.6;
  }

  .role-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .role-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-align: center;
  }

  body.light .role-btn {
    border-color: var(--light-border);
    color: var(--light-text);
  }

  body.light .role-btn:hover {
    background-color: var(--light-hover);
    border-color: var(--light-orange);
  }

  body.light .role-btn.active {
    background-color: var(--light-orange);
    border-color: var(--light-orange);
    color: white;
  }

  body.dark .role-btn {
    border-color: var(--dark-border);
    color: var(--dark-text);
  }

  body.dark .role-btn:hover {
    background-color: var(--dark-hover);
    border-color: var(--dark-orange);
  }

  body.dark .role-btn.active {
    background-color: var(--dark-orange);
    border-color: var(--dark-orange);
    color: white;
  }

  .code-container {
    position: relative;
  }

  .copy-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .copy-btn:hover {
    opacity: 1;
  }

  body.light .copy-btn {
    background-color: var(--light-hover);
  }

  body.dark .copy-btn {
    background-color: var(--dark-hover);
  }

  .clear-state-btn {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: var(--orange-color);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.7;
    transition: opacity 0.3s ease;
    z-index: 1000;
  }

  .clear-state-btn:hover {
    opacity: 1;
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 