import { bot } from "../bot.js";
import { lang } from "../language.js";

const cmdStartRegExp = /^\/start/;

const cmdStartFn = (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, lang.welcome);
};

export { cmdStartFn, cmdStartRegExp };
