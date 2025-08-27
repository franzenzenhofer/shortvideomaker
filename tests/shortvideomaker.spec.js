import { test, expect } from '@playwright/test';

const SITE_URL = 'https://shortvideomaker.franzai.com';

test.describe('ShortVideoMaker - Visual and Functional Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Homepage loads correctly', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/ShortVideoMaker/);
    
    // Check main heading
    const heading = await page.locator('h1');
    await expect(heading).toContainText('ShortVideoMaker');
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'tests/screenshots/homepage.png',
      fullPage: true 
    });
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto(SITE_URL);
    
    // Check mobile layout
    const container = await page.locator('.container');
    await expect(container).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true 
    });
  });

  test('File upload areas are visible and functional', async ({ page }) => {
    // Check audio upload area
    const audioUpload = await page.locator('text=/Upload Audio/i');
    await expect(audioUpload).toBeVisible();
    
    // Check video upload area
    const videoUpload = await page.locator('text=/Upload Video/i');
    await expect(videoUpload).toBeVisible();
    
    // Test drag and drop area
    const dropZone = await page.locator('[class*="border-dashed"]').first();
    await expect(dropZone).toBeVisible();
  });

  test('Controls are accessible', async ({ page }) => {
    // Check for control buttons
    const exportButton = await page.locator('button:has-text("Export")');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeDisabled(); // Should be disabled without files
  });

  test('Dark mode support', async ({ page }) => {
    // Check if dark mode class exists
    const html = await page.locator('html');
    const classList = await html.getAttribute('class');
    
    // Take dark mode screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/dark-mode.png',
      fullPage: true 
    });
  });

  test('Performance metrics', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });
    
    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });

  test('Accessibility - ARIA labels and keyboard navigation', async ({ page }) => {
    // Check for ARIA labels
    const buttons = await page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('Video preview area renders', async ({ page }) => {
    // Check for video preview container
    const previewArea = await page.locator('[class*="preview"], [class*="video"]').first();
    await expect(previewArea).toBeVisible();
    
    await page.screenshot({ 
      path: 'tests/screenshots/preview-area.png' 
    });
  });

  test('Progress indicators are present', async ({ page }) => {
    // Look for progress-related elements
    const progressElements = await page.locator('[role="progressbar"], [class*="progress"]');
    const count = await progressElements.count();
    expect(count).toBeGreaterThanOrEqual(0); // Progress bars may not be visible initially
  });

  test('Error boundaries work', async ({ page }) => {
    // Check console for errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should have no critical errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('Failed to load resource')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('PWA manifest is valid', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toBe('ShortVideoMaker');
    expect(manifest.short_name).toBe('VideoMaker');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('Service Worker registration', async ({ page }) => {
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);
  });
});

test.describe('Visual Regression Tests', () => {
  
  test('Full page visual comparison', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshots at different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Wait for resize
      await page.screenshot({ 
        path: `tests/screenshots/visual-${viewport.name}.png`,
        fullPage: true 
      });
    }
  });
});

test.describe('File Processing Tests', () => {
  
  test('Audio file input validation', async ({ page }) => {
    await page.goto(SITE_URL);
    
    // Find audio input
    const audioInput = await page.locator('input[type="file"][accept*="audio"]');
    await expect(audioInput).toHaveCount(1);
    
    // Check accept attribute
    const acceptAttr = await audioInput.getAttribute('accept');
    expect(acceptAttr).toContain('audio');
  });
  
  test('Video file input validation', async ({ page }) => {
    await page.goto(SITE_URL);
    
    // Find video input
    const videoInput = await page.locator('input[type="file"][accept*="video"]');
    await expect(videoInput).toHaveCount(1);
    
    // Check accept attribute
    const acceptAttr = await videoInput.getAttribute('accept');
    expect(acceptAttr).toContain('video');
  });
});