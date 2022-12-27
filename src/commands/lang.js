import { bot } from "../bot.js";
import { lang } from "../language.js";

const cmdLangRegExp = /^\/lang/;

const cmdLangFn = (msg) => {
  let chatId = msg.chat.id;

  let options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🇪🇸 Spanish", callback_data: "lang|es" }],
        [{ text: "🇺🇸 English", callback_data: "lang|en" }],
      ],
    }),
  };

  bot.sendMessage(chatId, lang.lang, options);
};

export { cmdLangFn, cmdLangRegExp };
