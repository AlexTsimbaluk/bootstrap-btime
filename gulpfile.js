'use strict';

var gulp = require('gulp'),
	del = require('del'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	cssnano = require('gulp-cssnano'),
	browserSync = require('browser-sync')
	;

gulp.task('less', function() {
	return gulp.src(['src/less/*.less', '!src/less/_*.less'])
			.pipe(less())
			.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
			.pipe(browserSync.reload({stream: true}))
			.pipe(gulp.dest('src/css/'))
			.pipe(concat('main.min.css'))
	        .pipe(cssnano())
			.pipe(gulp.dest('src/css/'));
});


gulp.task('clean', function() {
    return del.sync(['dist']);
});

gulp.task('build', ['clean', 'less', 'js-min'], function() {

    var buildCss = gulp.src([
        'src/css/main.css',
        'src/css/libs.min.css'
        ])
    .pipe(gulp.dest('dist/css'));

    var buildImg = gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'));

    var buildFonts = gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('src/js/**/*')
    .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));

    var buildPhp = gulp.src('src/*.php')
    .pipe(gulp.dest('dist'));

});

gulp.task('browser-sync', function() {
	browserSync({
		/*server: {
			baseDir: 'src'
		},*/
		proxy: 'soundstream',
		notify: false
	});
});

gulp.task('js-min', function() {
	return gulp.src('src/js/*.js')
			.pipe(uglify())
			.pipe(concat('main.min.js'))
			// .pipe(concat('main.js'))
			.pipe(gulp.dest('src/js'));

});


gulp.task('watch', ['browser-sync', 'js-min'], function() {
	gulp.watch('src/less/**/*.less', ['less']);
	gulp.watch('src/*.html', browserSync.reload);
	gulp.watch('src/*.php', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('default', ['watch']);

