/* Grabbing gulp packages*/

var gulp  = require('gulp'),
    babel = require('gulp-babel'),
    server = require('gulp-develop-server'),
    plumber = require('gulp-plumber');

var config = {
    sourceDir : "src/*.js",
    app : "build/app.js"
};

//building the server
gulp.task('build_serialnode', function(){
        return gulp.src(config.sourceDir)
             .pipe(plumber())
             .pipe(babel())
             .pipe(gulp.dest('build/'));
});

gulp.task('default', ['build_serialnode'], function () {
  "use strict";

  // starting the server when everything is done
  server.listen( { path: config.app } );

  // watching files for changes
  gulp.watch( ["src/promiseTest.js"], ["default"]);

});
