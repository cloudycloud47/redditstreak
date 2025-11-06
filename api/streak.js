import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user=username parameter" });
  }

  const url = `https://www.reddit.com/user/${user}/achievements/category/3/`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const streak = await page.evaluate(() => {
      const el = document.querySelector("span.current-streak");
      if (el && el.textContent) {
        return parseInt(el.textContent.trim());
      }
      const match = document.body.innerText.match(/(\d+)\s*day streak/i);
      return match ? parseInt(match[1]) : null;
    });

    res.status(200).json({ username: user, streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
