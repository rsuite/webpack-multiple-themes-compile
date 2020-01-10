const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const generateThemes = require('./generate-themes');
const defaultConfigs = require('./defaultConfigs');

const devMode = process.env.NODE_ENV !== 'production';

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
                hmr: devMode
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
      }),
      // 移除没用的文件
      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: [path.resolve(THEME_PATH, '*.js')],
        dangerouslyAllowCleanPatternsOutsideProject: true
      })
    ],
    optimization: {
      splitChunks: {
        // css 按照模块打包
        cacheGroups: themeNameSet.reduce((entry, themeName) => {
          entry[`${themeName}Theme`] = {
            name: themeName,
            test: (m, c, entry = themeName) =>
              m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
            chunks: 'all',
            enforce: true
          };
          return entry;
        }, {})
      }
    }
  };
};
