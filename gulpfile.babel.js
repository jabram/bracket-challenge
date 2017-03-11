'use strict'

import autoprefixer from 'gulp-autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import bs from 'browser-sync';
import buffer from 'vinyl-buffer';
import del from 'del';
import gulp from 'gulp';
import mocha from 'gulp-mocha';
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';

const browserSync = bs.create();
const config = {
  devDirectory: './src',
  html: {
    matcher: '/**/*.html'       // glob to match for html files
  },
  css: {
    directory: '/css',
    matcher: '/**/*.scss',
    excludeMatcher: '/partials/**'  // TODO: is there a way to allow exclude matchers for any task? if it exists, pass src as an array or something?
  },
  js: {
    directory: '/js',
    matcher: '/**/*.js',
    entries: [                    // array of all files that have require() statements, for bundling them all together
      './src/js/app.js'
    ],
    outputFile: 'bundle.js'      // the name of the final file
  },
  img: {
    directory: '/images',
    matcher: '/**/**.*'
  },
  mapsDirectory: './maps',
  testDirectory: './test',
  distDirectory: './dist',         // where to save the final files
  anyFile: '/**/*'
}

// these are additional options to add to the base bundle
function bundleJS(bundler) {
  bundler
    .bundle()
    .on('error', error => { console.log(`Browserify Error: ${error}`); })
    .pipe(source(config.js.outputFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write(config.mapsDirectory + config.js.directory))
    .pipe(gulp.dest(config.distDirectory))
    .pipe(browserSync.stream());
}

// tasks that do stuff
gulp.task('clean', () => {
  return del(config.distDirectory + config.anyFile);
});

gulp.task('test', () => {
  return gulp.src(config.testDirectory + config.anyFile)
    .pipe(mocha({
      compilers: ['js:babel-core/register']
    }))
    .on('error', (e) => { console.log(e); }); // without this line, running gulp errors when tests don't pass ("Error in plugin 'run-sequence(test)'")... something might not be right here...
});

gulp.task('watch-single', () => {
  return gulp.watch(config.testDirectory + config.anyFile)
    .on('change', (file) => {
      gulp.src(file.path)
      .pipe(mocha({
        compilers: ['js:babel-core/register']
      }))
      .on('error', (e) => { console.log(e); });
    });
});

gulp.task('build-html', () => {
  return gulp.src(config.devDirectory + config.html.matcher, { base: config.devDirectory })
    .pipe(gulp.dest(config.distDirectory))
    .pipe(browserSync.stream());
});

gulp.task('build-css', () => {
  return gulp.src([config.devDirectory + config.css.directory + config.css.matcher, '!' + config.devDirectory + config.css.directory + config.css.excludeMatcher], { base: config.devDirectory })
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer().on('error', function(e) { console.log('error yo:', e); }))
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write(config.mapsDirectory))
    .pipe(gulp.dest(config.distDirectory))
    .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
  // this is the base bundle
  let bundler = browserify({
    entries: config.js.entries,
    debug: true
  }).transform(babelify);

  return bundleJS(bundler);
});

gulp.task('build-img', () => {
  return gulp.src(config.devDirectory + config.img.directory + config.img.matcher, { base: config.devDirectory })
    .pipe(gulp.dest(config.distDirectory))
    .pipe(browserSync.stream());
});

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: config.distDirectory
    },
    open: false // to prevent drowning in tabs with every manual restart!
  });
});

gulp.task('watch', ['watch-single'], () => {
  gulp.watch(config.devDirectory + config.html.matcher, ['build-html']);
  gulp.watch(config.devDirectory + config.css.directory + config.css.matcher, ['build-css']);
  gulp.watch(config.devDirectory + config.js.matcher, ['test', 'build-js']);
  gulp.watch(config.devDirectory + config.img.directory + config.img.matcher, ['build-img']);
  // gulp.watch(config.testDirectory + config.anyFile, ['test']);
});


// tasks that call tasks
gulp.task('build', ['build-html', 'build-css', 'build-js', 'build-img']);

gulp.task('default', () => {
  runSequence('clean', 'test', 'build', 'serve', 'watch');
});
