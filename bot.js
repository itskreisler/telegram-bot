import TelegramBot from "node-telegram-bot-api";
import { lang } from "./src/language.js";
import { validateDomain } from "./src/validateDomain.js";
import { tiktokDL } from "./src/tiktokDL.js";
import { typeOptions } from "./src/helpers.js";
import axios from "axios";
import * as dotenv from "dotenv";
const {
  parsed: { TELEGRAM_TOKEN },
} = dotenv.config();
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
if (lang.welcome === "") lang.cb("en");

// start message
bot.onText(/^\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, lang.welcome);
});
// ping pong
bot.onText(/^\/ping/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "pong");
});
// language
bot.onText(/^\/lang/, (msg) => {
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
});
// detect url
bot.onText(
  /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:((www|[a-zA-Z0-9]+)\.))?([^:\/\n\?\=]+)/,
  async (msg, math) => {
    let chatId = msg.chat.id;
    let url = math.input;

    if (validateDomain(url)) {
      await tiktokDL(url, (x) => {
        if (!x.code) {
          bot
            .sendVideo(chatId, x.domain + x.data.hdplay, {
              caption: x.data.title,
            })
            .catch((e) => {
              bot.sendVideo(chatId, x.domain + x.data.play, {
                caption: x.data.title,
              });
            });
        } else {
          bot.sendMessage(chatId, lang.error);
        }

        //console.log(x.domain + x.data.play);
      });
      //bot.sendMessage(chatId, JSON.stringify(x));
    } else {
    }
  }
);

// yt
bot.onText(
  /^http.?:.*(?:youtube.com\/|youtu.be\/)(?:watch\?v=|watch\?t=.*v=|embed\/|)(\w{11})/g,
  async (msg, math) => {
    //console.log(math);
    let { searchParams, pathname } = new URL(msg.text);
    let v;
    if (!searchParams.get("v")) {
      const [, path] = pathname.split("/");
      v = path;
    } else {
      v = searchParams.get("v");
    }
    const cal = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];
    /* const imgs = cal.map((_) => ({
      url: `https://img.youtube.com/vi/${v}/${_}.jpg`,
    })); */
    let chatId = msg.chat.id;
    let options = {
      reply_markup: JSON.stringify({
        inline_keyboard: cal.map((_) => [
          {
            text: _,
            url: `https://img.youtube.com/vi/${v}/${_}.jpg`,
          },
        ]),
      }),
    };

    bot.sendMessage(chatId, "Seleciona la calidad de la imagen", options);
    //console.log(imgs);
  }
);
bot.onText(/^\/off/g, async () => {
  console.log("apagando...");
  //throw new Error("apagando...");
});
//ip
bot.onText(/^\/ip/, async (msg) => {
  const ipAPI = "https://api.ipify.org/?format=json",
    geoLocation = (_) => `https://sys.airtel.lv/ip2country/${_}/?full=true`;
  const req = await axios.get(ipAPI);
  const res = await req.data;
  console.log(res);
  /* fetchUrl(
    `https://api.thecatapi.com/v1/images/search`,
    function (error, meta, body) {
      const [info] = JSON.parse(body);
      console.log(info);
      bot.sendPhoto(msg.chat.id, info.url, {
        caption: "I'm a bot!",
      });
    }
  ); */

  bot.sendMessage(msg.chat.id, `Your IP address is ${res.ip}`);
});

// get errors
bot.on("polling_error", function (error) {
  console.log(error);
});
// get language options
bot.on("callback_query", (callbackQuery) => {
  const { text, action } = typeOptions(callbackQuery);
  switch (action) {
    case "answerCallbackQuery":
      bot.answerCallbackQuery(callbackQuery.id, {
        text: text,
        show_alert: true,
      });
      break;
    case "editMessageText":
      const msg = callbackQuery.message;
      const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
      };
      bot.editMessageText(text, opts);
      break;
    default:
      //const [, , url] = callbackQuery.data.split("|");
      //console.log(url);
      break;
  }
});
