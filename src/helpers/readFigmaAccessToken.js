import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

const ACCESS_TOKEN_KEY_PATH = path.resolve(__dirname, '..', 'access_token_key.txt');

export async function getFigmaAccessToken() {
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
export const clearFigmaAccessToken = () => {
  fs.writeFileSync(ACCESS_TOKEN_KEY_PATH, '', 'utf-8');
};

/** 获取 accessToken */
export const readFigmaAccessToken = () => {
  const result = fs.readFileSync(ACCESS_TOKEN_KEY_PATH, 'utf-8');
  if (!result) {
    return getFigmaAccessToken();
  } else {
    return result;
  }
};

