const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const multipleThemesCompile = require('../src/index');
const themesConfig = require('./themes.config');

const pathResolve = relativePath => path.join(__dirname, relativePath);
const readFile = path => fs.readFileSync(path, { encoding: 'utf-8' });
const outputPath = pathResolve('/build');

const webpackConfigs = {
  output: {
    path: outputPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
};

const generateCompiler = configs => webpack(multipleThemesCompile(webpackConfigs, configs));

const runCompiler = compiler => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.log(stats);
        reject(stats);
        return;
      }
      resolve();
    });
  });
};

test('Default test', done => {
  const compiler = generateCompiler({
    themesConfig,
    cssContent: 'body{color:@color}'
  });

  runCompiler(compiler).then(() => {
    const dist = fs.readdirSync(outputPath);
    expect(dist).toContain('theme-green.css');
    expect(dist).toContain('theme-yellow.css');
    expect(readFile(path.resolve(outputPath, './theme-green.css'))).toEqual(`body {
  color: #008000;
}
`);
    done();
  });
});

test('Output Name test', done => {
  const compiler = generateCompiler({
    themesConfig,
    cssContent: 'body{color:@color}',
    outputName: themeName => `css/${themeName}.css`
  });
  runCompiler(compiler).then(() => {
    const dist = fs.readdirSync(`${outputPath}/css`);
    expect(dist.length).toEqual(2);
    expect(dist).toContain('theme-green.css');
    expect(dist).toContain('theme-yellow.css');
    done();
  });
});
