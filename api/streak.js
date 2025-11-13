import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { user } = req.query;
  if (!user) {
    return res.status(400).json({ error: "Missing ?user=username" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(`https://www.reddit.com/user/${user}/achievements/category/3/`, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    const streak = await page.evaluate(() => {
      const el = document.querySelector("span.current-streak");
      return el ? el.textContent.trim() : null;
    });

    await browser.close();

    if (!streak) {
      return res.status(404).json({ error: "Could not find streak element" });
    }

    res.status(200).json({ user, streak });
  } catch (error) {
    if (browser) await browser.close();
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
