// /api/streak.js
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export default async function handler(req, res) {
  const { user } = req.query;
  if (!user) {
    return res.status(400).json({ error: "Missing ?user=username parameter" });
  }

  try {
    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const url = `https://www.reddit.com/user/${user}/achievements/category/3/`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Extract streak from the Reddit HTML
    const streak = await page.evaluate(() => {
      const el = document.querySelector(".current-streak");
      return el ? parseInt(el.textContent.trim()) : null;
    });

    await browser.close();

    if (!streak) {
      return res.status(404).json({ error: "Could not find streak on Reddit profile" });
    }

    return res.status(200).json({ user, streak });
  } catch (err) {
    console.error("❌ Puppeteer error:", err);
    return res.status(500).json({ error: err.message });
  }
}
