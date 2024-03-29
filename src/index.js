const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fs = require('fs');
const generateThemes = require('./generate-themes');
const defaultConfigs = require('./defaultConfigs');


function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

/**
 *
 * @param {Object} options - webpack options.
 * @param {Object} configs - configs
 * @param {Array} [configs.styleLoaders = [{ loader: 'css-loader' }, { loader: 'less-loader' }] ] - 处理 less 文件的 loader
 * @param {String} configs.themesConfig - 主题配置
 * @param {String} [configs.lessContent = @import "../index";] - 生成的 css 文件的内容
 * @param {String} [configs.preHeader = // Generate by Script.] - 生成文件的文件头内容
 * @param {String} [configs.cacheDir = ./src/less/themes] - 输出目录
 * @param {String} [configs.outputName = theme-[name].css] - 输出文件的文件名
 * @param {String} [configs.cwd = __dirname] - 相对输出路径
 * @return {Object}
 */
module.exports = function(configs) {
  const { themesConfig, cacheDir, cwd = __dirname, styleLoaders, outputName, publicPath } = 
    {
      ...defaultConfigs,
      ...{ styleLoaders: [{ loader: 'css-loader' }, { loader: 'less-loader' }] },
      ...configs
    }
  generateThemes(themesConfig, configs);
  // 主题路径
  const THEME_PATH = path.resolve(cwd, cacheDir);
  const themeFileNameSet = fs
    .readdirSync(path.resolve(THEME_PATH))
    .filter(fileName => /\.less/.test(fileName));
  const themeNameSet = themeFileNameSet.map(fileName =>
    path.basename(fileName, path.extname(fileName))
  );

  return {
    entry: themeNameSet.reduce((entry, theme) => {
      const filePath = path.resolve(THEME_PATH, `${theme}.js`);
      entry[theme] = filePath;
      return entry;
    }, {}),
    module: {
      rules: [
        {
          test: /\.(le|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath
              }
            },
            ...(styleLoaders || [])
          ]
        }
      ]
    },
    plugins: [
      // css 抽取插件
      new MiniCssExtractPlugin({
        filename: outputName,
        chunkFilename: `css/[id].css`
      })
    ],
  };
};
