import { Injectable } from '@nestjs/common';
import { BrandingConfig, LogoConfig, CoverConfig } from '../interfaces/documentation.interface';

@Injectable()
export class BrandingService {
  /**
   * Get resolved branding configuration with defaults
   */
  getResolvedBrandingConfig(brandingConfig?: BrandingConfig): BrandingConfig {
    return {
      favicon: brandingConfig?.favicon,
      logo: this.getResolvedLogoConfig(brandingConfig?.logo),
      cover: this.getResolvedCoverConfig(brandingConfig?.cover),
    };
  }

  /**
   * Get resolved logo configuration
   */
  private getResolvedLogoConfig(logoConfig?: LogoConfig): LogoConfig {
    if (!logoConfig?.src) {
      return {};
    }

    return {
      src: logoConfig.src,
      alt: logoConfig.alt || 'Logo',
      width: logoConfig.width || 'auto',
      height: logoConfig.height || '40px',
      position: logoConfig.position || 'header',
      link: logoConfig.link,
    };
  }

  /**
   * Get resolved cover configuration
   */
  private getResolvedCoverConfig(coverConfig?: CoverConfig): CoverConfig {
    if (!coverConfig?.src) {
      return {};
    }

    return {
      src: coverConfig.src,
      alt: coverConfig.alt || 'Cover image',
      position: coverConfig.position || 'top',
      height: coverConfig.height || '300px',
      opacity: coverConfig.opacity !== undefined ? coverConfig.opacity : 1,
      overlay: coverConfig.overlay || false,
      overlayColor: coverConfig.overlayColor || 'rgba(0, 0, 0, 0.4)',
    };
  }

  /**
   * Generate favicon HTML
   */
  generateFaviconHTML(brandingConfig?: BrandingConfig): string {
    const resolved = this.getResolvedBrandingConfig(brandingConfig);
    
    if (!resolved.favicon) {
      return '';
    }

    // Support different favicon formats
    const faviconUrl = resolved.favicon;
    const extension = faviconUrl.split('.').pop()?.toLowerCase();
    
    let type = 'image/x-icon';
    if (extension === 'png') type = 'image/png';
    if (extension === 'svg') type = 'image/svg+xml';
    if (extension === 'ico') type = 'image/x-icon';

    return `
      <link rel="icon" type="${type}" href="${faviconUrl}">
      <link rel="shortcut icon" type="${type}" href="${faviconUrl}">
      <link rel="apple-touch-icon" href="${faviconUrl}">
    `;
  }

  /**
   * Generate logo HTML for header
   */
  generateHeaderLogoHTML(brandingConfig?: BrandingConfig): string {
    const resolved = this.getResolvedBrandingConfig(brandingConfig);
    const logo = resolved.logo;
    
    if (!logo?.src || (logo.position !== 'header' && logo.position !== 'both')) {
      return '';
    }

    const logoImg = `
      <img 
        src="${logo.src}" 
        alt="${logo.alt}"
        style="width: ${logo.width}; height: ${logo.height}; object-fit: contain;"
        class="logo-image"
      />
    `;

    if (logo.link) {
      return `
        <a href="${logo.link}" class="logo-link flex items-center">
          ${logoImg}
        </a>
      `;
    }

    return `<div class="logo-container flex items-center">${logoImg}</div>`;
  }

  /**
   * Generate logo HTML for sidebar
   */
  generateSidebarLogoHTML(brandingConfig?: BrandingConfig): string {
    const resolved = this.getResolvedBrandingConfig(brandingConfig);
    const logo = resolved.logo;
    
    if (!logo?.src || (logo.position !== 'sidebar' && logo.position !== 'both')) {
      return '';
    }

    const logoImg = `
      <img 
        src="${logo.src}" 
        alt="${logo.alt}"
        style="width: ${logo.width}; height: ${logo.height}; object-fit: contain;"
        class="sidebar-logo-image"
      />
    `;

    if (logo.link) {
      return `
        <div class="sidebar-logo mb-4">
          <a href="${logo.link}" class="sidebar-logo-link flex items-center justify-center">
            ${logoImg}
          </a>
        </div>
      `;
    }

    return `
      <div class="sidebar-logo mb-4">
        <div class="sidebar-logo-container flex items-center justify-center">
          ${logoImg}
        </div>
      </div>
    `;
  }

  /**
   * Generate cover image HTML
   */
  generateCoverHTML(brandingConfig?: BrandingConfig): string {
    const resolved = this.getResolvedBrandingConfig(brandingConfig);
    const cover = resolved.cover;
    
    if (!cover?.src) {
      return '';
    }

    const overlayStyle = cover.overlay 
      ? `background: linear-gradient(${cover.overlayColor}, ${cover.overlayColor}), url('${cover.src}');`
      : `background-image: url('${cover.src}');`;

    switch (cover.position) {
      case 'background':
        return `
          <div class="cover-background" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            ${overlayStyle}
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${cover.opacity};
            z-index: -1;
          "></div>
        `;

      case 'hero':
        return `
          <div class="cover-hero" style="
            width: 100%;
            height: ${cover.height};
            ${overlayStyle}
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${cover.opacity};
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin-bottom: 2rem;
          ">
            ${cover.overlay ? `
              <div class="hero-content text-center text-white z-10 relative">
                <h1 class="text-4xl font-bold mb-4">API Documentation</h1>
                <p class="text-xl opacity-90">Comprehensive API reference and guides</p>
              </div>
            ` : ''}
          </div>
        `;

      case 'top':
      default:
        return `
          <div class="cover-top mb-8" style="
            width: 100%;
            height: ${cover.height};
            ${overlayStyle}
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: ${cover.opacity};
            border-radius: 0.75rem;
            overflow: hidden;
          "></div>
        `;
    }
  }

  /**
   * Generate branding CSS
   */
  generateBrandingCSS(brandingConfig?: BrandingConfig): string {
    const resolved = this.getResolvedBrandingConfig(brandingConfig);
    
    return `
      /* Branding Styles */
      .logo-link, .logo-container {
        transition: opacity 0.2s ease;
      }
      
      .logo-link:hover {
        opacity: 0.8;
      }
      
      .logo-image {
        max-width: 100%;
        height: auto;
      }
      
      .sidebar-logo {
        border-bottom: 1px solid var(--zedoc-border, #e2e8f0);
        padding-bottom: 1rem;
      }
      
      .sidebar-logo-image {
        max-width: 80%;
        height: auto;
      }
      
      .sidebar-logo-link:hover {
        opacity: 0.8;
      }
      
      .cover-hero .hero-content {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .cover-top, .cover-hero {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .logo-image {
          height: 32px !important;
        }
        
        .sidebar-logo-image {
          max-width: 70%;
        }
        
        .cover-top, .cover-hero {
          height: 200px !important;
        }
        
        .cover-hero .hero-content h1 {
          font-size: 2rem !important;
        }
        
        .cover-hero .hero-content p {
          font-size: 1rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .cover-top, .cover-hero {
          height: 150px !important;
        }
        
        .cover-hero .hero-content h1 {
          font-size: 1.5rem !important;
        }
        
        .cover-hero .hero-content p {
          font-size: 0.875rem !important;
        }
      }
    `;
  }

  /**
   * Get branding configuration examples
   */
  getBrandingExamples(): Array<{ name: string; description: string; config: BrandingConfig }> {
    return [
      {
        name: 'Simple Logo',
        description: 'Basic logo in header with favicon',
        config: {
          favicon: '/favicon.ico',
          logo: {
            src: '/logo.png',
            alt: 'Company Logo',
            height: '40px',
            position: 'header',
            link: 'https://example.com'
          }
        }
      },
      {
        name: 'Full Branding',
        description: 'Complete branding with logo, favicon, and hero cover',
        config: {
          favicon: '/favicon.svg',
          logo: {
            src: '/logo.svg',
            alt: 'API Logo',
            height: '45px',
            position: 'both',
            link: '/'
          },
          cover: {
            src: '/api-hero.jpg',
            alt: 'API Documentation',
            position: 'hero',
            height: '400px',
            overlay: true,
            overlayColor: 'rgba(59, 130, 246, 0.7)'
          }
        }
      },
      {
        name: 'Background Theme',
        description: 'Subtle background image with sidebar logo',
        config: {
          favicon: '/favicon.png',
          logo: {
            src: '/logo-white.png',
            alt: 'Logo',
            height: '35px',
            position: 'sidebar'
          },
          cover: {
            src: '/background-pattern.svg',
            position: 'background',
            opacity: 0.1
          }
        }
      },
      {
        name: 'Top Banner',
        description: 'Top banner image with header logo',
        config: {
          favicon: '/favicon.ico',
          logo: {
            src: '/logo-horizontal.png',
            alt: 'Company',
            height: '50px',
            width: '200px',
            position: 'header'
          },
          cover: {
            src: '/banner.jpg',
            alt: 'API Banner',
            position: 'top',
            height: '250px',
            opacity: 0.9
          }
        }
      }
    ];
  }
} 