import { fetchUrl } from "fetch";
import querystring from "querystring";
export const tiktokDL = async (url, cb) => {
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
    function (_error, _meta, body) {
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
