# webpack multiple themes compile

[![Build Status](https://travis-ci.org/rsuite/webpack-multiple-themes-compile.svg?branch=master)](https://travis-ci.org/rsuite/webpack-multiple-themes-compile)
[![Coverage Status](https://coveralls.io/repos/github/hiyangguo/webpack-mutiple-theme-bundle-css-demo/badge.svg?branch=master)](https://coveralls.io/github/hiyangguo/webpack-mutiple-theme-bundle-css-demo?branch=master)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)
![webpack](https://img.shields.io/badge/webpack-%3E%3D3%20%7C%20%3E%3D4-green.svg)

English | [中文版][readm-cn]

This library use to overwrite webpack config to output multiple themes in once compile.

## Install

```bash
npm i webpack-multiple-themes-compile webpack-merge
# Optional.If you didn't install extract-text-webpack-plugin.
npm i extract-text-webpack-plugin
```

## Example

Origin `webpack.config.js`

```javascript
module.exports = {
  output: {
    path: outPutPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
  // There is another options.
};
```

Change the `webpack.config.js` file.

```diff
+ const merge = require('webpack-merge');
+ const multipleThemesCompile = require('@hypers/webpack-multiple-themes-compile');
- module.exports = {
+ const webpackConfigs = {
  output: {
    path: outPutPath,
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
  // There is another options.
};

+ module.exports = merge(
+   webpackConfigs,
+   multipleThemesCompile({
+     themesConfig: {
+       green: {
+         color: '#008000'
+       },
+       yellow: {
+         color: '#ffff00'
+       }
+     },
+     lessContent: 'body{color:@color}'
+   })
+ );
```

Output directory tree.

```
.
├── theme-green.css
├── theme-yellow.css
└── themes.js
```

## API

```
/**
 * @param configs
 */
multipleThemesCompile(configs);
```

## configs

| Property       | Type`（Default）`                                                                  | Description                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| styleLoaders   | Array `[{ loader: 'css-loader' }, { loader: 'less-loader' }]`                      | The loaders to compile less.Details in [webpack homepage](https://webpack.js.org/configuration/module/#rule-loader)                                                                                  |
| themesConfig\* | Object                                                                             | Theme configuration. `key` for the file name of the generated css, `value` for the object .The object's key, the value is the name of the variable to be overwritten, and the value of the variable. |
| lessContent    | String `@import "../index";`                                                       | The content of cache less.                                                                                                                                                                           |
| preHeader      | String `// Generate by Script.`                                                    | The header of generate files.                                                                                                                                                                        |
| cacheDir       | String `./src/less/themes`                                                         | Cache Directory.                                                                                                                                                                                     |
| cwd            | String `__dirname`                                                                 | Relative output directory.                                                                                                                                                                           |
| outputName     | (themeName:String,fileName:String) => String `` themeName => `${themeName}.css` `` | Finally output pathname.                                                                                                                                                                             |

## Notice

If you used [`html-webpack-plugin`](https://www.npmjs.com/package/html-webpack-plugin),maybe you need added this config:

```diff
 new HtmlwebpackPlugin({
   filename: 'index.html',
   template: 'src/index.html',
   inject: 'body',
   // exclude themes.js
+  excludeChunks: ['themes']
 })
```

[readm-cn]: https://github.com/rsuite/webpack-multiple-themes-compile/blob/master/README_zh.md
