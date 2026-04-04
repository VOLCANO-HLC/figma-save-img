import path from 'path';
import shebang from 'rollup-plugin-preserve-shebang';

export default {
  input: path.resolve(__dirname, './src/index.js'),
  output: {
    dir: './lib',
    format: 'cjs',
  },
  plugins: [
    shebang({ shebang: '#!/usr/bin/env node' }),
  ],
};