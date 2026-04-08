'use strict';

var minimist = require('minimist');
var Figma = require('figma-api');
var ora = require('ora');
var chalk = require('chalk');
var fs = require('fs');
var https = require('https');
var inquirer = require('inquirer');
var path = require('path');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Figma__namespace = /*#__PURE__*/_interopNamespaceDefault(Figma);

const FIGMA_TYPE_FILES_NODE = 'getFileNodes';

const FIGMA_TYPE_FILES_IMAGE = 'getImage';

const EVENTS = {
  DATA: 'data',
  END: 'end',
  ERROR: 'error',
};

// 默认用户配置figma url
const DEFAULT_URL_CONFIG = 'figma-url.txt';

// 默认工作的文件夹路径
const DEFAULT_ROOT = process.cwd();

const loading = ora({
  spinner: { interval: 80, frames: ['-', '\\', '|', '/'] },
});

const loadingStart = message => loading.start(chalk.cyan(message));

const loadingSuccess = message => {
  loading.stopAndPersist({
    symbol: chalk.green('✔'),
    text: chalk.green(message),
  });
};

const loadingEnd = () => loading.stop();

const logInfo = (message, tag = '📮') =>
  console.log(`${tag} ${message}`);

const logWarn = message =>
  console.log(`${chalk.yellow(' ⚠️ ')} ${chalk.yellowBright(message)}`);

const logSuccess = message =>
  console.log(`${chalk.green(' ✨ ')} ${chalk.greenBright(message)}`);

const logError = message =>
  console.log(`${chalk.red(' ❌ ')} ${chalk.redBright(message)}`);

var tips = {
  loadingStart,
  loadingSuccess,
  loadingEnd,
  logInfo,
  logWarn,
  logSuccess,
  logError,
};

// import fs from 'fs';
// import path from 'path';

/** 从 url 获取 key 和 id */
const getParamsFromUrl = url => {
  const regex = /design\/([-\w]+)\/.+?node-id=([-:\w]+)&/;
  const result = url.match(regex);
  if (!result) {
    tips.logWarn('解析 url 出错');
  }
  let [_, key, id] = result;
  console.log('key, id',key, id);
  if (id) {
    id = id.replace(/-/, ':');
  }
  return {
    key,
    id,
  };
};

/** 处理节点信息，映射成 节点id-图片名 的关系 */
const getImagesIdByNode = children => {
  const info = {};
  children.forEach(item => {
    info[item.id] = item.name;
  });
  return info;
};

/** 把图片保存到当前终端下  */
// export const createImageFolder = () => {
//   const dirname = DEFAULT_ROOT;
//   if (!fs.existsSync(dirname)) {
//     fs.mkdirSync(dirname);
//   }
//   return dirname;
// };

/** 创建 figma-image-info.json 文件 */
// export const imageMessageFileSave = content =>
//   new Promise((resolve, reject) => {
//     fs.writeFile(
//       `${DEFAULT_ROOT}/${DEFAULT_IMGAE_INFO}`,
//       content,
//       function (e) {
//         resolve();
//       }
//     );
//   });

/** 获取 figma-image-info.json 文件 */
// export const getCacheImageFile = async () => {
//   const jsonPath = path.resolve(DEFAULT_ROOT, DEFAULT_IMGAE_INFO);
//   if (!fs.existsSync(jsonPath)) {
//     return false;
//   }
//   const result = await JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
//   return result;
// };

/** 下载图片到本地 */
const imageDownLoad = (dirname, { id, url, filename }) =>
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

const FIGMA_URL_PATH = `${DEFAULT_ROOT}/${DEFAULT_URL_CONFIG}`;

async function getFigmaUrl() {
  try {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: '请输入 figma URL',
        filter: mes => mes.trim(),
        validate(input) {
          const mes = String(input).trim();
          if (mes.length === 0) {
            return '请输入 figma URL';
          } else {
            return true;
          }
        },
      }
    ]);
    fs.writeFileSync(FIGMA_URL_PATH, url, 'utf-8');
    return url;
  } catch (err) {
    console.log(err);
  }
}

/** 获取 figma URL */
const readFigmaUrl = () => {
  if (fs.existsSync(FIGMA_URL_PATH)) {
    const result = fs.readFileSync(FIGMA_URL_PATH, 'utf-8');
    return result;
  } else {
    return getFigmaUrl();
  }
};

const ACCESS_TOKEN_KEY_PATH = path.resolve(__dirname, '..', 'access_token_key.txt');

async function getFigmaAccessToken() {
  try {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: '请输入 figma accessToken key',
        filter: mes => mes.trim(),
        validate(input) {
          const mes = String(input).trim();
          if (mes.length === 0) {
            return '请输入 figma accessToken key';
          } else {
            return true;
          }
        },
      }
    ]);
    fs.writeFileSync(ACCESS_TOKEN_KEY_PATH, url, 'utf-8');
    return url;
  } catch (err) {
    console.log(err);
  }
}

/** 清除 accessToken */
const clearFigmaAccessToken = () => {
  fs.writeFileSync(ACCESS_TOKEN_KEY_PATH, '', 'utf-8');
};

/** 获取 accessToken */
const readFigmaAccessToken = () => {
  const result = fs.readFileSync(ACCESS_TOKEN_KEY_PATH, 'utf-8');
  if (!result) {
    return getFigmaAccessToken();
  } else {
    return result;
  }
};

// console.log(__dirname, __filename,'??');
const argv = minimist(process.argv.slice(2));
const isSingle = argv._[0];

let figmaApi = null,
  figmaKey = null,
  imageInfo = {};

/** 获取切图所有节点 */
async function getFileNodes(id) {
  const file = await figmaApi[FIGMA_TYPE_FILES_NODE](figmaKey, [id]);
  return file.nodes[id].document;
}

/** 根据节点id 去获取图片 */
async function getFileImage(ids) {
  const result = await figmaApi[FIGMA_TYPE_FILES_IMAGE](figmaKey, {
    ids,
    use_absolute_bounds: true,
  });
  return result.images;
}

async function start() {
  const accessToken = await readFigmaAccessToken();
  let figmaUrl = null;
  if(isSingle){
    figmaUrl = isSingle;
  } else {
    figmaUrl = await readFigmaUrl();
  }
  run(accessToken, figmaUrl);
}

async function run(personalAccessToken, figmaUrl) {
  console.log();
  const url = decodeURIComponent(figmaUrl);
  tips.loadingStart(`正在获取figmaUrl：`);
  console.log();
  tips.logInfo(url);
  console.log();

  const { key, id } = getParamsFromUrl(url);
  if (!key) {
    return;
  }
  figmaKey = key;
  figmaApi = new Figma__namespace.Api({
    personalAccessToken,
  });
  tips.loadingEnd();

  tips.loadingStart('正在获取节点信息');
  let nodesInfo;
  try {
    nodesInfo = await getFileNodes(id);
  } catch (err) {
    tips.loadingEnd();
    const errStr = String(err).toLowerCase();
    if (errStr.includes('forbidden') || errStr.includes('403')) {
      console.log();
      tips.logError('Token 无效或已过期，请重新生成 Figma Personal Access Token');
      console.log();
      tips.logInfo('操作步骤：', '📋');
      tips.logInfo('1. 登录 Figma (https://www.figma.com)', '  ');
      tips.logInfo('2. 点击右上角头像 → Settings', '  ');
      tips.logInfo('3. 滚动到 Personal access tokens 区域', '  ');
      tips.logInfo('4. 点击 Generate new token，复制生成的 token', '  ');
      console.log();
      clearFigmaAccessToken();
      const newToken = await getFigmaAccessToken();
      return run(newToken, figmaUrl);
    }
    tips.logWarn(`获取节点信息失败，${err}`);
    process.exit(10);
  }
  if (isSingle) {
    imageInfo[id] = nodesInfo.name;
  } else {
    imageInfo = getImagesIdByNode(nodesInfo.children);
    // imageMessageFileSave(JSON.stringify(imageInfo));
  }
  const ids = Object.keys(imageInfo);
  const idsLen = ids.length;

  tips.loadingSuccess(`图片节点获取成功，共${ids.length}张`);
  tips.loadingStart('正在下载图片到本地');
  try {
    const urlInfo = await getFileImage(ids);
    // const dirname = createImageFolder();
    let index = 0;
    while (index < idsLen) {
      const id = ids[index];
      try {
        await imageDownLoad(DEFAULT_ROOT, {
          id,
          url: urlInfo[id],
          filename: imageInfo[id],
        });
      } catch (err) {
        tips.logWarn(err);
      } finally {
        tips.logSuccess(`${index + 1}/${idsLen}`);
        index++;
      }
    }
    tips.loadingSuccess('下载完成');
    console.log();
  } catch (err) {
    tips.loadingEnd();
    tips.logWarn(`下载失败，${err}`);
    process.exit(10);
  }
}

// console.log(process.cwd());
// main(url);
// tipsStart('?');
// tipsEnd('...')

exports.start = start;
