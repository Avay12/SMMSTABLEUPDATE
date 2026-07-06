const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating to localhost:8080/dashboard/admin...');
  try {
    await page.goto('http://localhost:8080/dashboard/admin', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();
})();
