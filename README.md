# webpack 多主题编译

这个库用于复写 webpack 配置以达到输出多套 css 的目的。

## 安装

```bash
npm i @hypers/webpack-multiple-themes-compile webpack-merge
# 如果你没有安装 extract-text-webpack-plugin （这里为了兼容古老的 webpack 版本，所以没有直接安装)
npm i extract-text-webpack-plugin
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
+ const multipleThemesCompile = require('@hypers/webpack-multiple-themes-compile');
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
 *
 * @param webpackConfig - webpack 原始配置
 * @param configs - 插件配置
 */
multipleThemesCompile(configs);
```

## configs 详细

| 属性名称       | 类型`（默认值）`                                                                   | 描述                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| styleLoaders   | Array `[{ loader: 'css-loader' }, { loader: 'less-loader' }]`                      | 处理 less 文件的 loader。详见 [webpack 官访文档](https://webpack.js.org/configuration/module/#rule-loader)     |
| themesConfig\* | Object                                                                             | 主题配置 , `key` 为生成的 css 的文件名，`value` 为一个对象。该对象的 key、value 分别为需要覆盖的变量名、变量值 |
| lessContent    | String `@import "../index";`                                                       | 缓存的 less 文件的内容                                                                                         |
| preHeader      | String `// Generate by Script.`                                                    | 生成文件的文件头内容                                                                                           |
| cacheDir       | String `./src/less/themes`                                                         | 缓存文件的目录                                                                                                       |
| cwd            | String `__dirname`                                                                 | 相对输出路径                                                                                                   |
| outputName     | (themeName:String,fileName:String) => String `` themeName => `${themeName}.css` `` | 最终输出的文件名                                                                                               |

## 注意

如果使用了 [`html-webpack-plugin`](https://www.npmjs.com/package/html-webpack-plugin) 则可能需要增加以下配置

```diff
 new HtmlwebpackPlugin({
   filename: 'index.html',
   template: 'src/index.html',
   inject: 'body',
   // 排除 themes.js
+  excludeChunks: ['themes']
 })
```
