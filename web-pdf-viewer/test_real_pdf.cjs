const puppeteer = require('puppeteer');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

(async () => {
  // Create a real PDF with pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText('HELLO WORLD THIS IS A REAL PDF', { x: 50, y: 350, size: 30, color: rgb(0, 0, 0) });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('real.pdf', pdfBytes);

  const browser = await puppeteer.launch({ headless: 'new' });
  const browserPage = await browser.newPage();
  
  browserPage.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await browserPage.goto('http://localhost:5175');
  
  await browserPage.evaluate(() => {
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

  await browserPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const openBtn = buttons.find(b => b.textContent.includes('Open PDF') || b.textContent.includes('Open'));
    if (openBtn) openBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));
  
  const inputEl = await browserPage.$('.injected-file-input');
  if (inputEl) {
    await inputEl.uploadFile('real.pdf');
  }

  await new Promise(r => setTimeout(r, 3000));
  
  // Try to read pixel data from the canvas
  const isCanvasBlank = await browserPage.evaluate(() => {
    const canvas = document.querySelector('.page-canvas');
    if (!canvas) return 'NO_CANVAS';
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let isBlank = true;
    let nonWhitePixels = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i] !== 255 || imageData[i+1] !== 255 || imageData[i+2] !== 255) {
        isBlank = false;
        nonWhitePixels++;
      }
    }
    return { isBlank, nonWhitePixels, w: canvas.width, h: canvas.height };
  });

  console.log("CANVAS CHECK REAL:", isCanvasBlank);

  await browser.close();
})();
