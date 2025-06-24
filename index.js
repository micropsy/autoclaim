// File: index.js
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CLAIM_URL = 'https://freebitco.in';

const bot = new TelegramBot(TELEGRAM_TOKEN);

async function sendTelegram(message) {
  try {
    await bot.sendMessage(CHAT_ID, `[Freebitco.in Bot]\n${message}`);
    console.log("[Telegram] Sent: " + message);
  } catch (e) {
    console.error("[Telegram] Failed to send message", e);
  }
}

async function autoClaim() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(CLAIM_URL, { waitUntil: 'networkidle2' });
    console.log("[Bot] Opened freebitco.in");

    // Wait & click "Verify you are human"
    const verifyBtn = await page.$("input[value='Verify you are human']");
    if (verifyBtn) {
      await verifyBtn.click();
      console.log("[Bot] Clicked verify button");
      await page.waitForTimeout(10000);
    } else {
      throw new Error("Verify button not found");
    }

    // Click the roll button
    const rollBtn = await page.$("#free_play_form_button");
    if (rollBtn) {
      await rollBtn.click();
      console.log("[Bot] Claimed!");
      await sendTelegram("✅ Successfully claimed at " + new Date().toLocaleTimeString());
    } else {
      throw new Error("Claim button not found");
    }
  } catch (err) {
    console.error("[Bot] Error:", err.message);
    await sendTelegram("⚠️ Claim failed: " + err.message);
  } finally {
    await browser.close();
  }
}

// Run once on start
autoClaim();

// Re-run every hour
setInterval(autoClaim, 60 * 60 * 1000);
