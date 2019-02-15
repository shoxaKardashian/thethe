"use strict";

var gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require("gulp-sass"),
    pug = require("gulp-pug"),
    babel = require("gulp-babel"),
    cssnano = require("gulp-cssnano"),
    concat = require("gulp-concat"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    spritesmith = require("gulp.spritesmith"),
    run = require("run-sequence"),
    rimraf = require("rimraf"),
    webserver = require("browser-sync");



/* Paths to source/build/watch files
=========================*/

var path = {
    build: {
        html:   "build/",
        js:     "build/js/",
        css:    "build/styles/",
        img:    "build/img/",
        fonts:  "build/fonts/",
        sprite: "build/img/sprite/"
    },
    src: {
        html:   "src/*.{pug,jade}",
        js:     "src/js/**/*.js",
        css:    "src/styles/*.scss",
        img:    "src/img/**/*.*",
        fonts:  "src/fonts/**/*.*",
        sprite: "src/img/sprite/*.png"
    },
    watch: {
        html:   "src/**/*.{pug,jade}",
        js:     "src/js/**/*.js",
        css:    "src/styles/**/*.scss",
        img:    "src/img/**/*.*",
        fonts:  "src/fonts/**/*.*",
        sprite: "src/img/sprite/*.png"
    },
    clean: "./build"
};



/* Webserver config
=========================*/

var config = {
    server: "build/",
    notify: false,
    open: true,
    ui: false,
    tunnel: true 
};


/* Tasks
=========================*/

gulp.task("webserver", function () {
    webserver(config);
});


gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("css:build", function () {
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: true
        }))
        // .pipe(cssnano({
        //     zindex: false,
        //     discardComments: {
        //         removeAll: true
        //     }
        // }))
        .pipe(rename("style.min.css"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("js:build", function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        //.pipe(gulp.dest(path.build.js))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat("bundle.js"))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("bundle.min.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task('sprite:build', function() {
    var spriteData = gulp.src(path.src.sprite) // путь, откуда берем картинки для спрайта
        .pipe(spritesmith({
            imgName: "sprite.png",
            imgPath: "../img/sprite.png",
            cssName: "sprite.scss",
            cssFormat: "scss",
            algorithm: "binary-tree",
            cssVarMap: function(sprite) {
                sprite.name = "s-" + sprite.name
            }
        }));
    spriteData.img.pipe(gulp.dest(path.build.img)); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest("./src/styles/global/")); // путь, куда сохраняем стили
});

gulp.task("image:build", function () {
    gulp.src(path.src.img)
        // .pipe(imagemin({
        //     optimizationLevel: 3,
        //     progressive: true,
        //     svgoPlugins: [{removeViewBox: false}],
        //     interlaced: true
        // }))
    .pipe(gulp.dest(path.build.img));
});




gulp.task("clean", function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('build', function (cb) {
    run(
        "clean",
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "sprite:build",
        "image:build"
    , cb);
});


gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:build");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start("fonts:build");
    });
    watch([path.watch.sprite], function(event, cb) {
        gulp.start("sprite:build");
    });
});


gulp.task("default", function (cb) {
   run(
       "clean",
       "build",
       "webserver",
       "watch"
   , cb);
});
