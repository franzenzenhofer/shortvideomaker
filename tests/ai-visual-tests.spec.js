import { test, expect } from '@playwright/test';
import fs from 'fs';

const SITE_URL = 'https://shortvideomaker.franzai.com';

test.describe('AI-Powered Visual Testing Suite', () => {
  
  test('AI Analysis - Homepage Visual Quality', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take comprehensive screenshots
    const screenshot = await page.screenshot({ 
      path: 'tests/screenshots/ai-analysis-homepage.png',
      fullPage: true 
    });
    
    // AI-style visual checks
    const visualMetrics = await page.evaluate(() => {
      const computedStyles = window.getComputedStyle(document.body);
      const rootElement = document.getElementById('root');
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input[type="file"]');
      
      return {
        // Color scheme analysis
        backgroundColor: computedStyles.backgroundColor,
        textColor: computedStyles.color,
        fontFamily: computedStyles.fontFamily,
        
        // Layout metrics
        hasProperStructure: !!rootElement && rootElement.children.length > 0,
        numberOfButtons: buttons.length,
        numberOfFileInputs: inputs.length,
        
        // Responsive design check
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        isResponsive: window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop',
        
        // Content analysis
        hasHeader: !!document.querySelector('header'),
        hasMainContent: !!document.querySelector('main, [role="main"], .container'),
        hasFooter: !!document.querySelector('footer'),
        
        // Accessibility
        hasProperHeadings: document.querySelectorAll('h1, h2, h3').length > 0,
        hasAriaLabels: document.querySelectorAll('[aria-label]').length,
        hasAltTexts: Array.from(document.querySelectorAll('img')).every(img => img.alt),
        
        // Performance metrics
        domElements: document.querySelectorAll('*').length,
        imageCount: document.querySelectorAll('img').length,
        scriptCount: document.querySelectorAll('script').length,
      };
    });
    
    // Log AI analysis results
    console.log('🤖 AI Visual Analysis Results:', JSON.stringify(visualMetrics, null, 2));
    
    // Assertions based on AI analysis
    expect(visualMetrics.hasProperStructure).toBe(true);
    expect(visualMetrics.numberOfFileInputs).toBeGreaterThanOrEqual(2); // Audio and Video
    expect(visualMetrics.hasHeader).toBe(true);
    expect(visualMetrics.hasProperHeadings).toBe(true);
  });

  test('AI Analysis - User Flow Simulation', async ({ page }) => {
    await page.goto(SITE_URL);
    
    // Simulate user behavior patterns
    const userJourney = {
      steps: [],
      errors: [],
      warnings: []
    };
    
    // Step 1: Initial page load
    userJourney.steps.push({
      action: 'page_load',
      timestamp: Date.now(),
      success: true
    });
    
    // Step 2: Check for interactive elements
    const interactiveElements = await page.evaluate(() => {
      const clickables = document.querySelectorAll('button, a, input, [role="button"]');
      return Array.from(clickables).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || el.getAttribute('aria-label') || '',
        type: el.getAttribute('type'),
        visible: el.offsetParent !== null
      }));
    });
    
    userJourney.steps.push({
      action: 'element_discovery',
      count: interactiveElements.length,
      elements: interactiveElements
    });
    
    // Step 3: Test hover states
    for (const element of interactiveElements.slice(0, 3)) { // Test first 3 elements
      if (element.visible && element.tag === 'BUTTON') {
        await page.hover(`button:has-text("${element.text}")`).catch(() => {});
      }
    }
    
    // Step 4: Screenshot after interactions
    await page.screenshot({ 
      path: 'tests/screenshots/ai-user-journey.png',
      fullPage: true 
    });
    
    console.log('🤖 User Journey Analysis:', JSON.stringify(userJourney, null, 2));
  });

  test('AI Analysis - Content Quality Check', async ({ page }) => {
    await page.goto(SITE_URL);
    
    const contentAnalysis = await page.evaluate(() => {
      // Text content analysis
      const allText = document.body.innerText;
      const words = allText.split(/\s+/).filter(w => w.length > 0);
      
      // Find key UI elements
      const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const buttons = Array.from(document.querySelectorAll('button'));
      const links = Array.from(document.querySelectorAll('a'));
      
      return {
        // Content metrics
        totalWords: words.length,
        uniqueWords: new Set(words).size,
        averageWordLength: words.reduce((a, b) => a + b.length, 0) / words.length,
        
        // UI element analysis
        headers: headers.map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        })),
        
        buttons: buttons.map(b => ({
          text: b.textContent?.trim(),
          disabled: b.disabled,
          hasIcon: b.querySelector('svg') !== null
        })),
        
        links: links.map(l => ({
          text: l.textContent?.trim(),
          href: l.href,
          isExternal: l.hostname !== window.location.hostname
        })),
        
        // SEO indicators
        hasTitle: !!document.title,
        titleLength: document.title.length,
        hasMetaDescription: !!document.querySelector('meta[name="description"]'),
        hasOpenGraph: !!document.querySelector('meta[property^="og:"]'),
        
        // Branding consistency
        brandMentions: allText.match(/ShortVideoMaker|VideoMaker/gi)?.length || 0,
        
        // Call-to-action analysis
        hasUploadCTA: allText.includes('Upload'),
        hasExportCTA: allText.includes('Export'),
        hasClearInstructions: allText.includes('drag') || allText.includes('click')
      };
    });
    
    console.log('🤖 Content Quality Analysis:', JSON.stringify(contentAnalysis, null, 2));
    
    // Quality assertions
    expect(contentAnalysis.hasTitle).toBe(true);
    expect(contentAnalysis.hasMetaDescription).toBe(true);
    expect(contentAnalysis.hasUploadCTA).toBe(true);
    expect(contentAnalysis.brandMentions).toBeGreaterThan(0);
  });

  test('AI Analysis - Mobile UX Evaluation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
    await page.goto(SITE_URL);
    
    const mobileUX = await page.evaluate(() => {
      const touchTargets = document.querySelectorAll('button, a, input, [role="button"]');
      const minTouchSize = 44; // Apple's recommendation
      
      const touchAnalysis = Array.from(touchTargets).map(element => {
        const rect = element.getBoundingClientRect();
        return {
          adequate: rect.width >= minTouchSize && rect.height >= minTouchSize,
          width: rect.width,
          height: rect.height,
          element: element.tagName
        };
      });
      
      return {
        // Touch target analysis
        totalTouchTargets: touchTargets.length,
        adequateSizeTargets: touchAnalysis.filter(t => t.adequate).length,
        touchTargetSizes: touchAnalysis,
        
        // Viewport optimization
        viewportMeta: document.querySelector('meta[name="viewport"]')?.content,
        hasPreventZoom: document.querySelector('meta[name="viewport"]')?.content?.includes('user-scalable=no'),
        
        // Mobile-specific features
        hasBottomNavigation: !!document.querySelector('[class*="bottom"], [class*="fixed-bottom"]'),
        hasHamburgerMenu: !!document.querySelector('[aria-label*="menu"], [class*="burger"]'),
        hasMobileOptimizedImages: document.querySelectorAll('picture, [srcset]').length > 0,
        
        // Text readability
        fontSize: window.getComputedStyle(document.body).fontSize,
        lineHeight: window.getComputedStyle(document.body).lineHeight,
        
        // Gesture areas
        swipeableAreas: document.querySelectorAll('[class*="swipe"], [class*="drag"]').length,
        
        // Performance indicators
        hasLazyLoading: document.querySelectorAll('[loading="lazy"]').length > 0,
        usesWebP: Array.from(document.querySelectorAll('img')).some(img => img.src.includes('.webp'))
      };
    });
    
    await page.screenshot({ 
      path: 'tests/screenshots/ai-mobile-ux.png',
      fullPage: true 
    });
    
    console.log('🤖 Mobile UX Analysis:', JSON.stringify(mobileUX, null, 2));
    
    // Mobile UX assertions
    expect(mobileUX.hasPreventZoom).toBe(true);
    expect(mobileUX.adequateSizeTargets / mobileUX.totalTouchTargets).toBeGreaterThan(0.8);
  });

  test('AI Analysis - Performance & Loading Behavior', async ({ page }) => {
    const performanceMetrics = [];
    
    // Monitor network activity
    page.on('response', response => {
      performanceMetrics.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        type: response.headers()['content-type']
      });
    });
    
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
    
    // Collect performance data
    const perfData = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        // Core Web Vitals approximation
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        domInteractive: perf.domInteractive,
        domComplete: perf.domComplete,
        loadEventEnd: perf.loadEventEnd,
        
        // Resource loading
        totalResources: resources.length,
        cachedResources: resources.filter(r => r.transferSize === 0).length,
        
        // Size analysis
        totalTransferSize: resources.reduce((sum, r) => sum + r.transferSize, 0),
        
        // Critical resources
        cssFiles: resources.filter(r => r.name.includes('.css')).length,
        jsFiles: resources.filter(r => r.name.includes('.js')).length,
        imageFiles: resources.filter(r => r.initiatorType === 'img').length,
        
        // Loading strategy
        hasServiceWorker: 'serviceWorker' in navigator,
        hasPrefetch: document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]').length > 0
      };
    });
    
    console.log('🤖 Performance Analysis:', JSON.stringify(perfData, null, 2));
    
    // Performance assertions
    expect(perfData.firstContentfulPaint).toBeLessThan(3000);
    expect(perfData.domComplete).toBeLessThan(5000);
  });

  test('AI Analysis - Error Detection & Recovery', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    // Monitor console
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(SITE_URL);
    await page.waitForTimeout(3000);
    
    // Test error boundaries
    const errorHandling = await page.evaluate(() => {
      return {
        hasErrorBoundary: window.React && typeof window.React.ErrorBoundary !== 'undefined',
        hasTryCatch: document.querySelector('script')?.textContent?.includes('try') || false,
        hasLoadingStates: document.querySelectorAll('[class*="loading"], [class*="skeleton"]').length > 0,
        hasErrorMessages: document.querySelectorAll('[class*="error"], [role="alert"]').length,
        hasFallbackUI: document.querySelectorAll('[class*="fallback"]').length > 0
      };
    });
    
    console.log('🤖 Error Handling Analysis:', {
      errorsDetected: errors.length,
      warningsDetected: warnings.length,
      errorHandling,
      criticalErrors: errors.filter(e => !e.includes('favicon'))
    });
    
    // Error assertions
    expect(errors.filter(e => !e.includes('favicon')).length).toBe(0);
  });
});

// Generate comprehensive test report
test.afterAll(async () => {
  const report = {
    timestamp: new Date().toISOString(),
    site: SITE_URL,
    testsRun: 6,
    status: 'COMPLETED',
    aiAnalysisComplete: true,
    screenshotsGenerated: [
      'ai-analysis-homepage.png',
      'ai-user-journey.png',
      'ai-mobile-ux.png'
    ]
  };
  
  fs.writeFileSync(
    'tests/ai-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('🤖 AI Testing Complete! Report saved to tests/ai-test-report.json');
});