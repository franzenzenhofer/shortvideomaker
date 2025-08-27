import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error);
  });

  console.log('Loading https://shortvideomaker.franzai.com...');
  
  try {
    await page.goto('https://shortvideomaker.franzai.com', { 
      waitUntil: 'networkidle' 
    });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(3000);
    
    // Check if root element has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        hasContent: root ? root.innerHTML.length > 0 : false,
        innerHTML: root ? root.innerHTML.substring(0, 200) : null
      };
    });
    
    console.log('Root element status:', rootContent);
    
    // Check for any React errors
    const bodyContent = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log('Body content preview:', bodyContent);
    
  } catch (error) {
    console.error('Error loading page:', error);
  }

  await browser.close();
})();