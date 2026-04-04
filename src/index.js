import minimist from 'minimist';
import * as Figma from 'figma-api';
import { FIGMA_TYPE_FILES_NODE, FIGMA_TYPE_FILES_IMAGE, DEFAULT_ROOT } from './helpers/const';
import {
  getParamsFromUrl,
  getImagesIdByNode,
  // getCacheImageFile,
  // createImageFolder,
  // imageMessageFileSave,
} from './helpers/index';
import { imageDownLoad } from './helpers/imageDownLoad';
import { readFigmaUrl } from './helpers/readFigmaUrl';
import { readFigmaAccessToken } from './helpers/readFigmaAccessToken';
import tips from './helpers/tips';

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

export async function start() {
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
  figmaApi = new Figma.Api({
    personalAccessToken,
  });
  tips.loadingEnd();

  tips.loadingStart('正在获取节点信息');
  const nodesInfo = await getFileNodes(id);
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
