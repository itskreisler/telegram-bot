import { bot } from '../bot'
import axios from 'axios'
const cmdIpRegExp = /^\/ip/

const cmdIpFn = async (msg) => {
  const ipAPI = 'https://api.ipify.org/?format=json'
  // const geoLocation = (_) => `https://sys.airtel.lv/ip2country/${_}/?full=true`
  const req = await axios.get(ipAPI)
  const res = await req.data
  console.log(res)
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

  bot.sendMessage(msg.chat.id, `Su dirección IP es ${res.ip}`)
}

export { cmdIpFn, cmdIpRegExp }
