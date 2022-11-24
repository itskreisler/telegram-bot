import { lang } from "./language.js";
export const typeOptions = (callbackQuery, cb) => {
  const [type, op] = callbackQuery.data.split("|");
  switch (type) {
    case "lang":
      lang.cb(op);
      return { text: lang.msgLang, action: "answerCallbackQuery" };
    case "edit":
      return { text: op, action: "editMessageText" };
    default:
      return { text: "", action: "" };
      break;
  }
};
