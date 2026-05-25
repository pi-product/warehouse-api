import "dotenv/config";
import axios from "axios";

async function main() {
  const baseURL = process.env.STONE3PL_API_URL;
  const appId = process.env.STONE3PL_APP_ID;
  const appSecret = process.env.STONE3PL_APP_SECRET;

  if (!baseURL || !appId || !appSecret) {
    console.error("Missing required env vars: STONE3PL_API_URL, STONE3PL_APP_ID, STONE3PL_APP_SECRET");
    process.exit(1);
  }

  console.log(`POST ${baseURL}/api/oauth/token`);
  console.log(`app_id: ${appId}`);

  try {
    const { data } = await axios.post(
      `${baseURL}/api/oauth/token`,
      { app_id: appId, app_secret: appSecret },
      { headers: { "Content-Type": "application/json" } }
    );

    if (data.error_code !== 0) {
      console.error(`Auth failed — error_code=${data.error_code} msg=${data.msg}`);
      process.exit(1);
    }

    const { accessToken, expiresIn } = data.data;
    console.log(`\nSuccess!`);
    console.log(`accessToken: ${accessToken.slice(0, 12)}...${accessToken.slice(-4)}`);
    console.log(`expiresIn:   ${expiresIn}s (${expiresIn / 60} min)`);
  } catch (err: any) {
    const status = err.response?.status;
    const body = err.response?.data ?? err.message;
    console.error(`Request failed — HTTP ${status ?? "network error"}`);
    console.error(body);
    process.exit(1);
  }
}

main();
