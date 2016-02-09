const gulp = require('gulp');
const babel = require('gulp-babel');
const wrap = require('gulp-exports');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const del = require('del');

gulp.task('build:node', () => {
  return gulp.src('src/index.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('build:browser', () => {
  return gulp.src('src/index.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(wrap('Fonts'))
    .pipe(rename('ultimate-fonts-loading.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:browser-min', () => {
  return gulp.src('src/index.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(wrap('Fonts'))
    .pipe(rename('ultimate-fonts-loading.min.js'))
    .pipe(uglify({
      compress: {
        warnings: false,
        dead_code: true,
        drop_console: true,
        unused: true
      }
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('build:node', 'build:browser', 'build:browser-min'));

gulp.task('watch:node', gulp.series('build:node', () => {
  gulp.watch(['src/*.js'], gulp.series('build:node'));
}));


gulp.task('watch:browser', gulp.series('build:browser', () => {
  gulp.watch(['src/*.js'], gulp.series('build:browser'));
}));

gulp.task('clean', () => {
  return del(['src/*.js']);
});

