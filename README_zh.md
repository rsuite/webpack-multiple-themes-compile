# webpack 多主题编译

[![Build Status](https://travis-ci.org/rsuite/webpack-multiple-themes-compile.svg?branch=master)](https://travis-ci.org/rsuite/webpack-multiple-themes-compile)
[![Coverage Status](https://coveralls.io/repos/github/hiyangguo/webpack-mutiple-theme-bundle-css-demo/badge.svg?branch=master)](https://coveralls.io/github/hiyangguo/webpack-mutiple-theme-bundle-css-demo?branch=master)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)
![webpack](https://img.shields.io/badge/webpack-%3E%3D4-green.svg)

[English][readme] | 中文版

这个库用于复写 webpack 配置以达到输出多套 css 的目的。

> 如果你使用的是 webpack@3 及以下版本，请使用[webpack-multiple-themes-compile@1](https://github.com/rsuite/webpack-multiple-themes-compile/tree/v1)

## 安装

```bash
npm i webpack-multiple-themes-compile webpack-merge
```

## 例子

原始`webpack.config.js`

```javascript
module.exports = {
  output: {
    path: outPutPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
  // 这里是其他的options
};
```

修改 `webpack.config.js`

```diff
+ const merge = require('webpack-merge');
+ const multipleThemesCompile = require('webpack-multiple-themes-compile');
- module.exports = {
+ const webpackConfigs = {
  output: {
    path: outPutPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
  // 这里是其他的options
};

+ module.exports = merge(
+   webpackConfigs,
+   multipleThemesCompile({
+     themesConfig: {
+       green: {
+         color: '#008000'
+       },
+       yellow: {
+         import: [
+           '~thirdpartylibrary/styles/yellow.less'
+         ],
+         color: '#ffff00'
+       }
+     },
+     lessContent: 'body{color:@color}'
+   })
+ );
```

输出

```
.
├── theme-green.css
├── theme-yellow.css
└── themes.js
```

## API

调用说明

```
/**
 * @param configs - 插件配置
 */
multipleThemesCompile(configs);
```

## configs 详细

| 属性名称       | 类型`（默认值）`                                                            | 描述                                                                                                           |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| styleLoaders   | Array `[{ loader: 'css-loader' }, { loader: 'less-loader' }]`               | 处理 less 文件的 loader。详见 [webpack 官访文档](https://webpack.js.org/configuration/module/#rule-loader)     |
| themesConfig\* | Object                                                                      | 主题配置 , `key` 为生成的 css 的文件名，`value` 为一个对象。该对象的 key、value 分别为需要覆盖的变量名、变量值 |
| lessContent    | String \| `(themeName:string,config:Object)=> String` `@import "../index";` | 缓存的 less 文件的内容                                                                                         |
| preHeader      | String `// Generate by Script.`                                             | 生成文件的文件头内容                                                                                           |
| cacheDir       | String `./src/less/themes`                                                  | 缓存文件的目录                                                                                                 |
| cwd            | String `__dirname`                                                          | 相对输出路径                                                                                                   |
| outputName     | String `theme-[name].css`                                                   | 最终输出的文件名。这个配置和 `webpackOptions.output` 一致。                                                    |

## 注意

如果使用了 [`html-webpack-plugin`](https://www.npmjs.com/package/html-webpack-plugin) 则可能需要增加以下配置

```diff
 new HtmlwebpackPlugin({
   filename: 'index.html',
   template: 'src/index.html',
   inject: 'body',
   // 排除 themes.js
+  excludeChunks: Object.keys(themesConfig)
 })
```

[readme]: https://github.com/rsuite/webpack-multiple-themes-compile/blob/master/README.md
