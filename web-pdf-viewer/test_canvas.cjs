const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const dummyPdfPath = 'dummy.pdf';

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('Error')) {
      console.log('PAGE ERROR LOG:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE EXCEPTION:', error.message));

  // Expose a function to log from inside the browser
  await page.exposeFunction('logFromBrowser', (msg) => {
    console.log('BROWSER:', msg);
  });

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

  await new Promise(r => setTimeout(r, 3000));
  
  // Try to read pixel data from the canvas to see if it's completely blank/white
  const isCanvasBlank = await page.evaluate(() => {
    const canvas = document.querySelector('.page-canvas');
    if (!canvas) return 'NO_CANVAS';
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let isBlank = true;
    let nonWhitePixels = 0;
    // Check if every pixel is rgba(255, 255, 255, 255)
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i] !== 255 || imageData[i+1] !== 255 || imageData[i+2] !== 255) {
        isBlank = false;
        nonWhitePixels++;
      }
    }
    return { isBlank, nonWhitePixels, w: canvas.width, h: canvas.height };
  });

  console.log("CANVAS CHECK:", isCanvasBlank);

  await browser.close();
})();
