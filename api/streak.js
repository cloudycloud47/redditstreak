import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).json({ error: "Missing ?user= parameter" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`https://www.reddit.com/user/${username}/achievements/category/3/`, {
      waitUntil: "networkidle2",
    });

    // extract the current streak number
    const streak = await page.evaluate(() => {
      const el = document.querySelector(".current-streak");
      return el ? parseInt(el.textContent.trim()) : null;
    });

    await browser.close();

    if (!streak) {
      return res.status(404).json({ error: "Streak not found" });
    }

    return res.status(200).json({ username, streak });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
