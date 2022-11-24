import http from "https";
import { tiktokdownload } from "tiktok-scraper-without-watermark";

export const getUrl = async (url, cb) => {
  let tiktok = tiktokdownload(url);
  let { nowm } = await tiktok;
  let req = http.get(nowm);

  req.on("response", async (data) => {
    await cb(data.rawHeaders[11]);
  });
};
