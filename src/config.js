import * as dotenv from "dotenv";
const { parsed } = dotenv.config();
export const BOT_ID = Number(parsed.TELEGRAM_TOKEN.split(":")[0]);
/* export const AUTHORIZED_USERS = parsed.AUTHORIZED_USERS.split(",").map((id) =>
  parseInt(id)
); */
export { parsed as envFile };
