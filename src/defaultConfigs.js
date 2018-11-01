module.exports = {
  cacheDir: './src/less/themes',
  outputName: themeName => `${themeName}.css`,
  lessContent: `@import "../index";`,
  preHeader: '// Generate by Script.'
};
