const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {
    try {
      await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 5000 });
    } catch (e2) {
      try {
        await page.goto('http://localhost:5175', { waitUntil: 'networkidle0', timeout: 5000 });
      } catch (e3) {
        console.log("Could not reach dev server");
      }
    }
  }

  // Create a real PDF
  const fs = require('fs');
  fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 0 >>\nstream\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000199 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n245\n%%EOF\n');
  
  // Find file input and upload
  try {
    const inputUploadHandle = await page.$('input[type=file]');
    if (inputUploadHandle) {
      await inputUploadHandle.uploadFile('dummy.pdf');
      console.log('PDF uploaded successfully via input');
    } else {
      console.log('No file input found');
    }
  } catch (e) {
    console.log('Failed to upload', e);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
