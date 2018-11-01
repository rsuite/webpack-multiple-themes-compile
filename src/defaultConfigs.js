module.exports = {
  outputDir: './src/less/themes',
  outputName: themeName => `${themeName}.css`,
  cssContent: `@import "../index";`,
  preHeader: '// Generate by Script.'
};
