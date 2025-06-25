// Use ES Module syntax only
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Constants
const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;
const SITE_URL = "https://freebitco.in";
const INTERVAL = 60 * 60 * 1000; // 1 hour

// Telegram notifier
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `[Freebitco.in Bot]\n${message}`
      })
    });
    console.log("✅ Telegram sent");
  } catch (e) {
    console.error("❌ Telegram error:", e.message);
  }
}

// Auto claim function
async function autoClaim() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(SITE_URL, { waitUntil: 'networkidle2' });

  try {
    const verifyButton = await page.$("input[value='Verify you are human']");
    if (verifyButton) {
      await verifyButton.click();
      await page.waitForTimeout(10000);
    }

    const claimButton = await page.$("#free_play_form_button");
    if (claimButton) {
      await claimButton.click();
      await page.waitForTimeout(10000);
      await sendTelegram("✅ Claimed successfully at " + new Date().toLocaleTimeString());
    } else {
      await sendTelegram("⚠️ Claim button not found");
    }
  } catch (e) {
    await sendTelegram("❌ Error during claim: " + e.message);
  } finally {
    await browser.close();
  }
}

// Initial run
autoClaim();

// Run every hour
setInterval(autoClaim, INTERVAL);
