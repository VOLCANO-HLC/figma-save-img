// import fs from 'fs';
// import path from 'path';
import tips from './tips';

/** 从 url 获取 key 和 id */
export const getParamsFromUrl = url => {
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
export const getImagesIdByNode = children => {
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

