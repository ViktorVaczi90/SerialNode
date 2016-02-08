/* Grabbing gulp packages*/

var gulp  = require('gulp'),
    babel = require('gulp-babel'),
    server = require('gulp-develop-server'),
    plumber = require('gulp-plumber');

var sources = {
    app : "src/*.js"
};


//building the server
gulp.task('build_serialnode', function(){
        return gulp.src(sources.app)
             .pipe(plumber())
             .pipe(babel())
             .pipe(gulp.dest('build/'));
});


gulp.task('default', ['build_serialnode'], function () {
  "use strict";

  // starting the server when everything is done
  server.listen( { path: 'build/app.js' } );

  // watching files for changes
  gulp.watch( [sources.app], ['build_serialnode', server.restart]);

});
