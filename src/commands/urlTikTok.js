import { bot } from "../bot.js";
import { validateDomain } from "../validateDomain.js";
import { tiktokDl } from "../tiktokDl.js";

const cmdUrlTikTokRegExp =
  /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:((www|[a-zA-Z0-9]+)\.))?([^:\/\n\?\=]+)/;

const cmdUrlTikTokFn = async (msg, math) => {
  let chatId = msg.chat.id;
  let url = math.input;

  if (validateDomain(url)) {
    await tiktokDl(url, async (x) => {
      if (!x.code) {
        if ("images" in x.data) {
          try {
            /* Promise.all(
              x.data.images.map((_, i) =>
                bot.sendPhoto(chatId, _, { caption: i })
              )
            ).then(() => {
              bot.sendMessage(chatId, {});
            }); */

            Promise.all([
              bot.sendMediaGroup(
                chatId,
                x.data.images.map((media, i) => ({
                  type: "photo",
                  media,
                  caption: `Esta es la imagen ${i}`,
                }))
              ),
            ]).then(async () => {
              await bot.sendMessage(
                chatId,
                x.data.title == null ? msg.text : x.data.title,
                {
                  parse_mode: "Markdown",
                }
              );
            });
          } catch (_error) {
            bot.sendMessage(
              chatId,
              "Ocurrio un error al enviar las imagenes.\nVuelve a intentarlo más tarde. :)"
            );
          }
        } else {
          const btns = ["play", "hdplay", "wmplay", "music"];
          let reply_markup_video = JSON.stringify({
            inline_keyboard: btns.map((_) => [
              {
                text: _,
                url: x.domain + x.data[_],
              },
            ]),
          });
          try {
            await bot.sendVideo(chatId, x.domain + x.data.hdplay, {
              caption: x.data.title,
              reply_markup: reply_markup_video,
            });
          } catch (_error) {
            await bot.sendVideo(chatId, x.domain + x.data.play, {
              caption: x.data.title,
              reply_markup: reply_markup_video,
            });
          }
        }
      } else {
        bot.sendMessage(chatId, lang.error);
      }

      //console.log(x.domain + x.data.play);
    });
    //bot.sendMessage(chatId, JSON.stringify(x));
  } else {
  }
};

export { cmdUrlTikTokFn, cmdUrlTikTokRegExp };
