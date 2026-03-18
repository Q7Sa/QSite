const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching headless browser to debug localhost:8080...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    try {
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 5000 });
    } catch (e) {
        console.log("Navigation issue:", e.message);
    }

    if (errors.length > 0) {
        console.log("--- BROWSER ERRORS DETECTED ---");
        errors.forEach(e => console.log(e));
    } else {
        console.log("No browser errors detected.");
    }

    const html = await page.content();
    console.log("Page title:", await page.title());

    await browser.close();
})();
