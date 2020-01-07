const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');

const defaultConfigs = require('./defaultConfigs');

const write = function(pathLike, content) {
  const dirname = path.dirname(pathLike);
  fs.ensureDirSync(dirname);
  fs.writeFileSync(pathLike, content, 'utf-8');
};

const getModifyVariablesContent = variableConfig => {
  const declaredContent = _.map(_.entries(variableConfig), ([key, value]) => `@${key}:${value};`);
  return declaredContent.join('\r');
};

/**
 * 生成主题文件
 * @param themesConfig
 * @param configs
 */
const generateThemes = (themesConfig = {}, configs = {}) => {
  const { cacheDir, lessContent, preHeader, cwd = __dirname } = { ...defaultConfigs, ...configs };
  const resolve = _.partial(path.resolve, cwd);

  _.forEach(_.entries(themesConfig), ([theme, config]) => {
    const lessFileName = `${theme}.less`;
    const jsFileName = `${theme}.js`;
    const modifyVariablesContent = getModifyVariablesContent(config);
    const content = `${typeof lessContent === 'function' ? lessContent(theme, config) : lessContent}

${preHeader}
${modifyVariablesContent}`;
    const outPutLessFilePath = resolve(cacheDir, lessFileName);
    const outPutJsFilePath = resolve(cacheDir, jsFileName);
    let flag = true;
    try {
      write(outPutLessFilePath, content);
      write(
        outPutJsFilePath,
        `${preHeader}
import './${lessFileName}';`
      );
    } catch (e) {
      console.log(e.message);
      flag = false;
    }
    console.log(
      `webpack-multiple-themes-compile: Generate ${outPutLessFilePath} ${
        flag ? 'Succeed' : 'Failed'
      }.`
    );
  });
};

module.exports = generateThemes;
