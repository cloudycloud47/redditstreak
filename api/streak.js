import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing ?user=username" });
  }

  let browser;
  try {
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(`https://www.reddit.com/user/${user}/achievements/category/3/`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const streak = await page.evaluate(() => {
      const el = document.querySelector("span.current-streak");
      return el ? el.textContent.trim() : null;
    });

    await browser.close();

    if (!streak) {
      return res.status(404).json({ error: "Streak not found" });
    }

    return res.status(200).json({ user, streak });
  } catch (err) {
    console.error("Scrape error:", err);
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
