const gulp = require('gulp');
const babel = require('gulp-babel');
const wrap = require('gulp-wrap');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const del = require('del');

gulp.task('build:browser', () => {
  return gulp.src('src/**.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(wrap('(function() { <%= contents %> }());'))
    .pipe(gulp.dest('lib'));
});

gulp.task('build:browser-min', () => {
  return gulp.src('src/**.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(wrap('(function() { <%= contents %> }());'))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(uglify({
      compress: {
        warnings: false,
        dead_code: true,
        drop_console: true,
        unused: true
      }
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('build', gulp.series('build:browser', 'build:browser-min'));

gulp.task('watch:browser', gulp.series('build:browser', () => {
  gulp.watch(['src/*.js'], gulp.series('build:browser'));
}));

gulp.task('clean', () => {
  return del(['lib/*.js']);
});

