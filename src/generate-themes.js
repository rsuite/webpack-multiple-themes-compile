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
  const { outputDir, cssContent, preHeader, cwd = __dirname } = { ...defaultConfigs, ...configs };
  const resolve = _.partial(path.resolve, cwd);

  _.forEach(_.entries(themesConfig), ([theme, config]) => {
    const fileName = `${theme}.less`;
    const modifyVariablesContent = getModifyVariablesContent(config);
    const content = `${cssContent}

${preHeader}
${modifyVariablesContent}`;
    const outPutFilePath = resolve(outputDir, fileName);
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
    resolve(outputDir, 'themes.js'),
    `${preHeader}\n${jsContent}`
  );
};

module.exports = generateThemes;
