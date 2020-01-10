const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const merge = require('webpack-merge');
const multipleThemesCompile = require('../src/index');
const themesConfig = require('./themes.config');

const pathResolve = relativePath => path.join(__dirname, relativePath);
const readFile = path => fs.readFileSync(path, { encoding: 'utf-8' });
const outputPath = pathResolve('/build');

const webpackConfig = {
  output: {
    path: outputPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
};

const generateCompiler = configs => webpack(merge(webpackConfig, multipleThemesCompile(configs)));

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
    lessContent: 'body{color:@color}'
  });

  runCompiler(compiler).then(() => {
    const dist = fs.readdirSync(outputPath);
    expect(dist).toContain('theme-green.css');
    expect(dist).toContain('theme-yellow.css');
    expect(dist).toContain('theme-red.css');
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
    lessContent: 'body{color:@color}',
    outputName: 'css/theme-[name].css'
  });
  runCompiler(compiler).then(() => {
    const dist = fs.readdirSync(`${outputPath}/css`);
    expect(dist.length).toEqual(3);
    expect(dist).toContain('theme-green.css');
    expect(dist).toContain('theme-yellow.css');
    expect(dist).toContain('theme-red.css');
    done();
  });
});
