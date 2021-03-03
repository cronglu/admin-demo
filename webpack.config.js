/*
* 本文件为配置 WebStorm Webpack resolve alias
* 非实际 Webpack 配置文件
* */

const path = require('path');

function resolve(dir) {
  return path.join(__dirname, '.', dir);
}

module.exports = {
  resolve: {
    alias: {
      components: resolve('src/components'),
      layouts: resolve('src/layouts'),
      utils: resolve('src/utils'),
      'antd-noform': resolve('src/utils/noform'),
    },
  },
};
