import fs from 'fs';
import inquirer from 'inquirer';
import { DEFAULT_ROOT, DEFAULT_URL_CONFIG } from './const';

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
export const readFigmaUrl = () => {
  if (fs.existsSync(FIGMA_URL_PATH)) {
    const result = fs.readFileSync(FIGMA_URL_PATH, 'utf-8');
    return result;
  } else {
    return getFigmaUrl();
  }
};

