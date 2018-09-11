const gulp = require('gulp');
const beautifyHtml = require('gulp-html-beautify');
const path = require('path');
const modify = require('gulp-modify-file');
const fs = require('fs-extra');

const removeComments = content => {
  let modified = content;
  while (modified.indexOf('<!--') >= 0) {
    modified =
      modified.slice(0, modified.indexOf('<!--')) +
      modified.slice(modified.indexOf('-->') + 3);
  }
  return modified;
};

const removeUnwantedLines = content => {
  const lines = content.split('\n');
  const wantedLines = lines.filter(
    line => line.indexOf('meta name="theme-color"') < 0 && line.match(/[^\s\n]/)
  );
  return wantedLines.join('\n');
};

const removePublicUrl = content => content.replace(/%PUBLIC_URL%\//g, '');

module.exports = function registerHtmlRelatedGulpTasks(baseDir) {
  gulp.task('processHtml', function() {
    const renderedFile = path.resolve(baseDir, 'build', 'rendered.html');
    const rendered = fs.readFileSync(renderedFile, 'utf-8');
    fs.removeSync(renderedFile);
    return gulp
      .src('public/index.html')
      .pipe(
        modify(content =>
          content.replace(
            '</head>',
            '<link rel="stylesheet" href="styles/index.css">\n</head>'
          )
        )
      )
      .pipe(
        modify(content => content.replace('<div id="root"></div>\n', rendered))
      )
      .pipe(modify(removeComments))
      .pipe(beautifyHtml({ indent_size: 2 }))
      .pipe(modify(removeUnwantedLines))
      .pipe(modify(removePublicUrl))
      .pipe(gulp.dest(path.resolve(baseDir, 'build')));
  });
};
