const fs = require('fs-extra');
const path = require('path');
const generateThemes = require('../src/generate-themes');

const readFile = path => fs.readFileSync(path, { encoding: 'utf-8' });

describe('Default generate.', () => {
  generateThemes({
    red: {
      'base-color': '#ff0000'
    },
    dark: {
      import: [
        '~rsuite/lib/styles/themes/dark/index'
      ],
      color: '#e5e5e5'
    }
  });
  const outPutFilePath = path.resolve(process.cwd(), './src/src/less/themes');
  const fileList = fs.readdirSync(outPutFilePath);
  const resolvePath = pathLike => path.resolve(outPutFilePath, pathLike);

  test('Files length validate.', () => {
    expect(fileList).toContain('red.less');
    expect(fileList).toContain('red.js');
  });

  test('red.js content validate.', () => {
    expect(readFile(resolvePath('red.js'))).toEqual(
      `// Generate by Script.
import './red.less';`
    );
  });

  test('red.less content validate.', () => {
    expect(readFile(resolvePath('red.less'))).toEqual(
      `@import "../index";

// Generate by Script.
@base-color:#ff0000;`
    );
  });

  test('dark.less import validate', () => {
    expect(readFile(resolvePath('dark.less'))).toEqual(
      `@import '~rsuite/lib/styles/themes/dark/index';
@import "../index";

// Generate by Script.
@color:#e5e5e5;`
    );
  })
});

describe('Multiple themes generate.', () => {
  const cacheDir = './src/less/multiple-themes';
  generateThemes(
    {
      green: {
        color: '#008000'
      },
      yellow: {
        color: '#ffff00'
      }
    },
    {
      cacheDir
    }
  );

  const fileList = fs.readdirSync(path.resolve(process.cwd(), './src', cacheDir));

  test('Files validate.', () => {
    expect(fileList).toContain('green.less');
    expect(fileList).toContain('green.js');
    expect(fileList).toContain('yellow.less');
    expect(fileList).toContain('yellow.js');
  });
});

describe('Change cacheDir.', () => {
  const cacheDir = './src/less/new-themes';
  generateThemes(
    {
      red: {
        'base-color': '#ff0000'
      }
    },
    {
      cacheDir
    }
  );

  const outPutFilePath = path.resolve(process.cwd(), './src', cacheDir);
  const resolvePath = pathLike => path.resolve(outPutFilePath, pathLike);
  const fileList = fs.readdirSync(outPutFilePath);

  test('Files length validate.', () => {
    expect(fileList.length).toEqual(2);
  });

  test('red.js content validate.', () => {
    expect(readFile(resolvePath('red.js'))).toEqual(
      `// Generate by Script.
import './red.less';`
    );
  });

  test('red.less content validate.', () => {
    expect(readFile(resolvePath('red.less'))).toEqual(
      `@import "../index";

// Generate by Script.
@base-color:#ff0000;`
    );
  });
});

describe('Change cwd.', () => {
  const cacheDir = './themes';
  const cwd = __dirname;
  generateThemes(
    {
      red: {
        'base-color': '#ff0000'
      }
    },
    {
      cacheDir,
      cwd
    }
  );

  const outPutFilePath = path.resolve(cwd, cacheDir);
  const resolvePath = pathLike => path.resolve(outPutFilePath, pathLike);
  const fileList = fs.readdirSync(outPutFilePath);

  test('Files length validate.', () => {
    expect(fileList.length).toEqual(2);
  });

  test('red.js content validate.', () => {
    expect(readFile(resolvePath('red.js'))).toEqual(
      `// Generate by Script.
import './red.less';`
    );
  });

  test('red.less content validate.', () => {
    expect(readFile(resolvePath('red.less'))).toEqual(
      `@import "../index";

// Generate by Script.
@base-color:#ff0000;`
    );
  });
});

describe('Change lessContent and preHeader.', () => {
  const lessContent = `// test lessContent
@import "../index";`;
  const preHeader = '// Generate by Script test.';
  const cacheDir = './src/less/change-lesscontent';
  generateThemes(
    {
      red: {
        'base-color': '#ff0000'
      }
    },
    {
      lessContent,
      preHeader,
      cacheDir
    }
  );
  const outPutFilePath = path.resolve(process.cwd(), './src', cacheDir);
  const fileList = fs.readdirSync(outPutFilePath);
  const resolvePath = pathLike => path.resolve(outPutFilePath, pathLike);

  test('Files length validate.', () => {
    expect(fileList).toContain('red.less');
    expect(fileList).toContain('red.js');
  });

  test('red.js content validate.', () => {
    expect(readFile(resolvePath('red.js'))).toEqual(
      `// Generate by Script test.
import './red.less';`
    );
  });

  test('red.less content validate.', () => {
    expect(readFile(resolvePath('red.less'))).toEqual(
      `// test lessContent
@import "../index";

// Generate by Script test.
@base-color:#ff0000;`
    );
  });
});

describe('Change lessContent use function.', () => {
  const cacheDir = './src/less/change-lesscontent-use-function';
  generateThemes(
    {
      blue: {
        'base-color': '#0000ff'
      }
    },
    {
      cacheDir,
      lessContent: (themeName, config) => {
        return `// test lessContent themeName:${themeName}
@import "../index";`;
      }
    }
  );

  const outPutFilePath = path.resolve(process.cwd(), './src', cacheDir);
  const resolvePath = pathLike => path.resolve(outPutFilePath, pathLike);

  test('blue.less content validate.', () => {
    expect(readFile(resolvePath('blue.less'))).toEqual(
      `// test lessContent themeName:blue
@import "../index";

// Generate by Script.
@base-color:#0000ff;`
    );
  });
});
