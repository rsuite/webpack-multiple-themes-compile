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
  const { cacheDir,  lessContent, preHeader, cwd = __dirname } = { ...defaultConfigs, ...configs };
  const resolve = _.partial(path.resolve, cwd);

  _.forEach(_.entries(themesConfig), ([theme, config]) => {
    const fileName = `${theme}.less`;
    const modifyVariablesContent = getModifyVariablesContent(config);
    const content = `${lessContent}

${preHeader}
${modifyVariablesContent}`;
    const outPutFilePath = resolve(cacheDir, fileName);
    let flag = true;
    try {
      write(outPutFilePath, content);
    } catch (e) {
      console.log(e.message);
      flag = false;
    }
    console.log(`Generate ${outPutFilePath} ${flag ? 'Succeed' : 'Failed'}.`);
  });

  const jsContent = _.map(_.keys(themesConfig), theme => `import './${theme}.less';`).join('\r');

  write(
    resolve(cacheDir, 'themes.js'),
    `${preHeader}\n${jsContent}`
  );
};

module.exports = generateThemes;
