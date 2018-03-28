var fs = require("fs");
var console = require("console");
var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var console = require("console");
var browserify = require('browserify');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('gulplog');
var uglify = require('gulp-uglify');
var aliasify = require('aliasify');
var vueify = require('vueify');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');
var ext = require('gulp-ext-replace');
var rename = require("gulp-rename");

var dist = "web/vendor";

// Global resources, directly accessed, not compiled
var resources = [
    "node_modules/font-awesome/fonts",
    "node_modules/font-awesome/css",
    "node_modules/bootstrap-sass/assets",
    "node_modules/jquery/dist",
    "node_modules/respond.js/dest",
    "node_modules/html5shiv/dist",
];

// SASS import dirs
var sassPaths = [
    "web/vendor/font-awesome/scss",
    "web/vendor/bootstrap-sass/assets/stylesheets",
];

function findFiles(path) {
    var prepend = path + "/";
    if (path == "" || path == "." || path == "/") {
        prepend = "";
    }
    var l = fs.readdirSync(path);
    var all = [];
    for (var i = 0; i < l.length; i++) {
        all[all.length] = prepend + l[i];
    }
    return all;
}

function sassFiles(path) {
    var all = findFiles(path);
    var sass = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].endsWith(".scss") && all[i] != "config.scss" && !all[i].endsWith("/config.scss")) {
            console.log("Found " + all[i]);
            sass[sass.length] = all[i];
        }
    }

    gulp.src(sass)
        .pipe($.sass({
            includePaths: sassPaths,
            // outputStyle: 'compressed' // if css compressed **file size**
            outputStyle: 'expanded'
        })
        .on('error', console.log))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path));
}

gulp.task('js', function () {
    console.log("Running js task...");
    try {
         // set up the browserify instance on a task basis
         var b = browserify({
           entries: 'web/js/main.jsx',
           debug: true,
           // defining transforms here will avoid crashing your stream
           transform: [ aliasify ]
         });
        
         return b.bundle()
          // WHY TWO TIMES!?
          .pipe(source('web/js/main.jsx')) // destination file for browserify, relative to gulp.dest
          .pipe(buffer())
          .pipe(vueify())
          .pipe(rename("web/js/main.js"))
          //.pipe(uglify())
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(sourcemaps.write('./'))
          .on('error', log.error)
          .pipe(gulp.dest('.'));
    } catch (e) {
       console.log("ERROR running js task: " + e);
    }
  });
  

gulp.task('sass', function () {
    console.log("Running sass task...");
    try {
        sassFiles(".");
        sassFiles("web/css");
    } catch (e) {
        console.log("ERROR running sass task: " + e);
    }
});

gulp.task('resources', function () {
    console.log("Running resources task...");
    try {
        for (var i = 0; i < resources.length; i++) {
            var path = resources[i];
            var dst = path.replace(/^.*node_modules\//g, "");
            dst = dist + "/" + dst;
            if (path.indexOf("->") > 0) {
                dst = path.substring(path.indexOf("->") + 2);
                path = path.substring(0, path.indexOf("->"));
            }
            path = path.trim();
            dst = dst.trim();
            if (isfile(path)) {
                console.log("Copying file from " + path + " to " + dst);
                dst = dst.substring(0, dst.lastIndexOf("/"));
                gulp.src([path]).pipe(gulp.dest(dst));
            } else
                if (isdir(path)) {
                    console.log("Copying resources from " + path + " to " + dst);
                    gulp.src([path + "/**"]).pipe(gulp.dest(dst));
                } else {
                    throw "Not a file or directory: " + path;
                }
        }
    } catch (e) {
        console.log("ERROR running resources task: " + e);
    }
});

function isdir(dir) {
    var stats = fs.statSync(dir);
    return stats && stats.isDirectory();
}

function isfile(f) {
    var stats = fs.statSync(f);
    return stats && stats.isFile();
}

function havefile(f) {
    try {
        var stats = fs.statSync(f);
        return stats && stats.isFile();
    } catch (e) {
        return false;
    }
}

gulp.task('watch', [], function () {
    gulp.watch([
        "web/css/**",
        "web/js/**",
        "*.scss"
    ], [ "resources", "sass", "js" ]);
});

console.log("Prepared tasks");
