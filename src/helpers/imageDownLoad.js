import fs from 'fs';
import https from 'https';
import {
  EVENTS,
} from './const';

/** 下载图片到本地 */
export const imageDownLoad = (dirname, { id, url, filename }) =>
  new Promise((resolve, reject) => {
    const _resolve = res => {
      resolve(res);
      // onComplete(res);
    };
    const req = https.get(url, res => {
      const eTag = res.headers.etag;
      const fileStream = fs.createWriteStream(`${dirname}/${filename}.png`);
      res.pipe(fileStream);
      res.on(EVENTS.END, () => {
        _resolve({
          id,
          eTag,
        });
      });
      res.on(EVENTS.ERROR, () => {
        reject();
      });
    });
    req.on(EVENTS.ERROR, () => {
      reject();
    });
  });