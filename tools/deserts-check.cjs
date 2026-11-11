const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://127.0.0.1:8801/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('#sound-toggle', { timeout: 15000 });
  const before = await page.evaluate(() => !!window.__soundscape);
  await page.click('#sound-toggle');
  await new Promise(r => setTimeout(r, 1200));
  const on = await page.evaluate(() => ({
    engine: !!window.__soundscape,
    state: window.__soundscape?.context?.state,
    pressed: document.querySelector('#sound-toggle').getAttribute('aria-pressed'),
  }));
  // Change realm (to Frigid) and light (to night) - should crossfade without errors
  await page.select('#realm', '1');
  await page.select('#time', '0.95');
  await new Promise(r => setTimeout(r, 1200));
  const afterChange = await page.evaluate(() => !!window.__soundscape && window.__soundscape.context.state);
  await page.click('#sound-toggle');
  await new Promise(r => setTimeout(r, 600));
  const off = await page.evaluate(() => ({
    engine: !!window.__soundscape,
    pressed: document.querySelector('#sound-toggle').getAttribute('aria-pressed'),
  }));
  console.log(JSON.stringify({ before, on, afterChange, off, errors }, null, 1));
  await browser.close();
})();
