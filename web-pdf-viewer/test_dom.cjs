const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const dummyPdfPath = 'dummy.pdf';

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5175');
  
  await page.evaluate(() => {
    window.originalCreateElement = document.createElement;
    document.createElement = function(tag) {
      const el = window.originalCreateElement.call(document, tag);
      if (tag.toLowerCase() === 'input') {
        el.className = 'injected-file-input';
        document.body.appendChild(el);
      }
      return el;
    };
  });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const openBtn = buttons.find(b => b.textContent.includes('Open PDF') || b.textContent.includes('Open'));
    if (openBtn) openBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));
  
  const inputEl = await page.$('.injected-file-input');
  if (inputEl) {
    await inputEl.uploadFile(dummyPdfPath);
  }

  await new Promise(r => setTimeout(r, 2000));
  
  // Inspect DOM
  const domInfo = await page.evaluate(() => {
    const viewer = document.querySelector('.virtualized-page-list');
    if (!viewer) return { error: 'virtualized-page-list not found' };
    
    const pages = Array.from(document.querySelectorAll('.page-container'));
    return {
      viewerExists: !!viewer,
      viewerRect: viewer.getBoundingClientRect().toJSON(),
      pageCount: pages.length,
      pages: pages.map(p => ({
        rect: p.getBoundingClientRect().toJSON(),
        hasCanvas: !!p.querySelector('canvas')
      }))
    };
  });

  console.log("DOM INFO:", JSON.stringify(domInfo, null, 2));

  await browser.close();
})();
