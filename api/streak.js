import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const { user } = req.query;
  if (!user) return res.status(400).json({ error: "Missing ?user=" });

  let browser = null;
  try {
    browser = await puppeteer.launch({
      executablePath: chromium.path, // use path instead of executablePath()
      args: chromium.args,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(`https://www.reddit.com/user/${user}/achievements/category/3/`, {
      waitUntil: "networkidle2"
    });

    const streak = await page.evaluate(() => {
      const el = document.querySelector(".current-streak");
      return el ? parseInt(el.textContent.trim()) : null;
    });

    res.status(200).json({ streak });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  } finally {
    if (browser) await browser.close();
  }
}
