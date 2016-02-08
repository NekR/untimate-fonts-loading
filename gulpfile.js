const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('dev');

gulp.task('build', () => {
  return gulp.src('src/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', () => {
  gulp.watch(['src/*.js'], gulp.series('build'));
});

gulp.task('clean', () => {
  return del(['src/*.js']);
});