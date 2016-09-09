var gulp               = require('gulp');             
var fs                 = require('fs');
var pump                 = require('pump');
var es                 = require('event-stream');
var path               = require('path');
var uglify             = require('gulp-uglify'); 
var sass               = require('gulp-sass');

var less               = require('gulp-less');
var cssmin             = require('gulp-minify-css');
var rename             = require('gulp-rename'); 
var autoprefixer       = require('gulp-autoprefixer');
var include            = require('gulp-include');
var notify             = require("gulp-notify");
var imagemin           = require("gulp-imagemin"); 
var livereload         = require('gulp-livereload');
var sourcemaps         = require('gulp-sourcemaps');

var srcPath            = 'templates/src/';            // Path to the source files
var distPath           = 'templates/dist/';            // Path to the distribution files

// Paths that gulp should watch
var watchPaths        = {
    scripts:     [
        srcPath+'assets/js/*.js',
        srcPath+'assets/js/**/*.js'
    ],
    images:     [
        srcPath+'assets/img/**'
    ],
    css:         [
        srcPath+'assets/css/*.css'
    ],
    less:         [
         srcPath+'assets/less/*.less',
         srcPath+'assets/less/**/*.less'
     ],
     sass:         [
        srcPath+'assets/sass/*.scss',
        srcPath+'assets/sass/**/*.scss'
    ],
    fonts:      [
        srcPath+'assets/fonts/**'
    ],
    html:          [
        srcPath+'**/*.html'
    ]
};

// Task for sass files
gulp.task('sass', function () {
    gulp
        .src(srcPath + 'assets/sass/*.scss')
        .pipe(include())
        .pipe(sass())
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running sass task" }))
        .pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions'], cascade: false }))
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running sass task" }))
        .pipe(cssmin({ keepBreaks: false }))
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running sass task" }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(distPath + 'assets/css'));
});

// Task for less
gulp.task('less', function () {
  gulp
    .src(srcPath + 'assets/less/bootstrap.less')
    .pipe(include())
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running less task" }))
    .pipe(cssmin({ keepBreaks: false }))
    .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running less task" }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath + 'assets/css'));
});

// Task for css
gulp.task('css', function () {
  gulp
    .src(srcPath + 'assets/css/*.css')
    .pipe(include())
    .pipe(cssmin({ keepBreaks: false }))
    .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running less task" }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath + 'assets/css'));
});

/*
// Javscript task
gulp.task('scripts', function(){
    gulp
        .src(srcPath + 'assets/js/*.js')
        .pipe(include())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running scripts task" }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(distPath + 'assets/js'));
});
*/

// Javscript task
gulp.task('scripts', function(cb){
    pump( [
        gulp.src(srcPath + 'assets/js/*.js'),        
        gulp.dest(distPath + 'assets/js')
        ], cb);
});

// Font task
gulp.task('fonts', function () {
    gulp
        .src([srcPath + 'assets/fonts/**'])
        .pipe(gulp.dest(distPath + 'assets/fonts'));
});

// HTML task
gulp.task('html', function () {
    gulp
        .src([srcPath + '*.html'])
        .pipe(include())
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running html task" }))
        .pipe(gulp.dest(distPath));
});

// Images task
gulp.task('images', function () {
    gulp
        .src(srcPath + 'assets/img/**')
        .pipe(imagemin())
        .on("error", notify.onError({ message: "Error: <%= error.message %>", title: "Error running image task" }))
        .pipe(gulp.dest(distPath + 'assets/img'));
});

// Watch task
gulp.task('watch', function() {
    gulp.watch(watchPaths.scripts, ['scripts']);
    gulp.watch(watchPaths.images, ['images']);
    gulp.watch(watchPaths.sass, ['sass']);
    gulp.watch(watchPaths.less, ['less']);
    gulp.watch(watchPaths.less, ['css']);
    gulp.watch(watchPaths.html, ['html']);
    gulp.watch(watchPaths.fonts, ['fonts']);

    livereload.listen();
    gulp.watch(distPath + '**').on('change', livereload.changed);
});

// Default task
gulp.task('default', ['scripts', 'images', 'sass', 'less', 'css', 'fonts', 'html', 'watch']);
