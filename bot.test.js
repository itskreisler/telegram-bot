import axios from "axios";
import fs from "fs";
import http from "https";
import { parse, stringify, toJSON, fromJSON } from "flatted";
import { fetchUrl } from "fetch";
import querystring from "querystring";
const tiktokDL = async (url, cb) => {
  const temp = "./temp/temp.json";
  const domain = "https://www.tikwm.com";
  const body = {
    url,
    count: 12,
    cursor: 0,
    web: 1,
    hd: 1,
  };
  fetchUrl(
    `${domain}/api/?${querystring.stringify(body)}`,
    function (error, meta, body) {
      //console.log("data" in body);
      //fs.writeFileSync(temp, body);
      //const rawdata = fs.readFileSync(temp);
      const info = JSON.parse(body);
      cb({ ...info, domain });
    }
  );
  //fs.writeFileSync("programming.json", res.data);
  //console.log(querystring.stringify(body));
};
// tiktokDL("https://vm.tiktok.com/ZMF9BkX5f/", (x) => {
//   console.log(x);
// });
