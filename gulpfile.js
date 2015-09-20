var gulp = require('gulp'),
	sass = require('gulp-sass'),
	jade = require('gulp-jade'),
	browserSync = require('browser-sync'),
  imagemin = require('gulp-imagemin'),
  autoprefixer = require('gulp-autoprefixer');
//sass
gulp.task('sass', function() {
  return gulp.src('app/scss/style.scss')
    .pipe(sass()) 
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});
//jade
gulp.task('jade', function() {
  return gulp.src('app/index.jade')
    .pipe(jade({
      pretty: true
    })) 
    .pipe(gulp.dest('app/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
  })
});

gulp.task('images', function(){
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

gulp.task('watch', ['browserSync', 'sass', 'jade'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']); 
  // Reloads the browser whenever Jade or JS files change
  gulp.watch('app/*.jade', ['jade']); 
  gulp.watch('app/js/**/*.js', browserSync.reload);
});