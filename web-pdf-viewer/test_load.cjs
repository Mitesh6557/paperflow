const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Create a dummy PDF
  const dummyPdfPath = 'dummy.pdf';
  if (!fs.existsSync(dummyPdfPath)) {
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n147\n%%EOF\n');
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5175');
  
  console.log("Page loaded. Looking for file input...");
  
  // Wait for the Open PDF button to be present and attach a file to the invisible input it creates
  // Since the input is created dynamically on click, we might need to intercept the click or override document.createElement
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

  // Click the Open PDF button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const openBtn = buttons.find(b => b.textContent.includes('Open PDF') || b.textContent.includes('Open'));
    if (openBtn) openBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));
  
  const inputEl = await page.$('.injected-file-input');
  if (inputEl) {
    console.log("Uploading file...");
    await inputEl.uploadFile(dummyPdfPath);
  } else {
    console.log("File input not found");
  }

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
