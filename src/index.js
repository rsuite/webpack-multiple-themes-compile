const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const generateThemes = require('./generate-themes');
const defaultConfigs = require('./defaultConfigs');

/**
 *
 * @param {Object} options - webpack options.
 * @param {Object} configs - configs
 * @param {Array} [configs.styleLoaders = [{ loader: 'css-loader' }, { loader: 'less-loader' }] ] - 处理 less 文件的 loader
 * @param {String} configs.themesConfig - 主题配置
 * @param {String} [configs.lessContent = @import "../index";] - 生成的 css 文件的内容
 * @param {String} [configs.preHeader = // Generate by Script.] - 生成文件的文件头内容
 * @param {String} [configs.cacheDir = ./src/less/themes] - 输出目录
 * @param {String} [configs.outputName = themeName => `${themeName}.css`] - 输出文件的文件名
 * @param {String} [configs.cwd = __dirname] - 相对输出路径
 * @return {Object}
 */
module.exports = function(configs) {
  const { themesConfig, cacheDir, cwd = __dirname, styleLoaders, outputName } = _.extend(
    defaultConfigs,
    { styleLoaders: [{ loader: 'css-loader' }, { loader: 'less-loader' }] },
    configs
  );
  generateThemes(themesConfig, _.pick(configs, ['cacheDir', 'lessContent', 'preHeader']));
  // 主题路径
  const THEME_PATH = path.resolve(cwd, cacheDir);
  const resolveToThemeStaticPath = fileName => path.resolve(THEME_PATH, fileName);
  const themeFileNameSet = fs
    .readdirSync(path.resolve(THEME_PATH))
    .filter(fileName => /\.less/.test(fileName));
  const getThemeName = fileName => `theme-${path.basename(fileName, path.extname(fileName))}`;

  // 全部 ExtractLessS 的集合
  const themesExtractLessSet = themeFileNameSet.map(fileName => {
    const themeName = getThemeName(fileName);
    return new ExtractTextPlugin(outputName(themeName, fileName));
  });
  // 主题 Loader 的集合
  const themeLoaderSet = themeFileNameSet.map((fileName, index) => {
    return {
      test: /\.(less|css)$/,
      include: resolveToThemeStaticPath(fileName),
      loader: themesExtractLessSet[index].extract({
        use: styleLoaders
      })
    };
  });

  return {
    entry: {
      themes: path.resolve(THEME_PATH, 'themes.js')
    },
    module: {
      rules: themeLoaderSet
    },
    plugins: themesExtractLessSet
  };
};
