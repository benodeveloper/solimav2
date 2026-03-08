import { CredentialsService } from "@/src/services/credentials.service";
import { chromium } from "playwright";

interface Credentials {
  host: string;
  username: string;
  password: string;
}

function extractCredentials(data: string): Credentials {
  const usernameMatch = data.match(/Username\s*:\s*(\w+)/);
  const passwordMatch = data.match(/Password\s*:\s*(\w+)/);
  const hostMatch = data.match(/Host \/ URL\s*:\s*(https?:\/\/[^\s\n]+)/);

  return {
    username: usernameMatch ? usernameMatch[1] : "",
    password: passwordMatch ? passwordMatch[1] : "",
    host: hostMatch ? hostMatch[1] : "",
  };
}

async function main() {
  const headless = process.env.CHROMIUM_HEADLESS !== "false";
  const shopUrl = process.env.IPTV_SHOP_URL;

  if (!shopUrl) throw new Error("IPTV_SHOP_URL is not set");

  const browser = await chromium.launch({ headless, slowMo: 500 });
  const page = await browser.newPage();
  await page.goto(shopUrl);

  const webhookPromise = page.waitForResponse(
    (response) =>
      response.url().startsWith("https://n8n.srv928744.hstgr.cloud/webhook/") &&
      response.request().method() === "POST",
  );

  await page.click("#iptv-trial-form button");

  try {
    const response = await webhookPromise;
    const status = response.status();
    const json = await response.json();
    const credentials = extractCredentials(json.output);

    console.log(`Form Submitted! Status: ${status}`);
    console.log("Submission captured, sending to Slack...");
    console.log(`credentials : ${JSON.stringify(credentials)}`);
    await CredentialsService.saveCredentials(credentials);
    console.log("Credentials saved to database.");
    // await sendCredentialsToSlack(credentials);
  } catch (error) {
    console.error(`Failed to get response from n8n: ${error}`);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
    process.exit(0);
  }

}

main();
