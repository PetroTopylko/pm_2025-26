const { src, dest, series, parallel, watch } = require('gulp');
const fileInclude = require('gulp-file-include');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

const paths = {
    html: 'src/app/index.html',
    htmlWatch: 'src/app/**/*.html',
    scss: 'src/app/scss/**/*.scss',
    js: 'src/app/js/**/*.js',
    imgs: 'src/app/imgs/**/*.+(jpg|jpeg|png|gif|svg)',
    dist: 'dist',
    distCss: 'dist/css',
    distJs: 'dist/js',
    distImgs: 'dist/imgs'
};

// --- Build tasks (with BrowserSync where possible) ---

function html_task() {
    return src(paths.html)
        .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream());
}

function scss_task() {
    return src(paths.scss)
        .pipe(concat('index.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min', extname: '.css' }))
        .pipe(dest(paths.distCss))
        .pipe(browserSync.stream());
}

function js_task() {
    return src(paths.js)
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.distJs));
}

function imgs_task() {
    return src(paths.imgs)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true
        }))
        .pipe(dest(paths.distImgs));
}

// --- Dev server & reload ---

function serve_task(done) {
    browserSync.init({
        server: { baseDir: paths.dist },
        open: true,
        notify: false
    });
    done();
}

function reload(done) {
    browserSync.reload();
    done();
}

// --- Watch: inject or reload as needed ---

function watch_task() {
    watch(paths.htmlWatch, html_task);
    watch(paths.scss, scss_task);
    watch(paths.js, series(js_task, reload));
    watch(paths.imgs, series(imgs_task, reload));
}

const build = series(html_task, parallel(scss_task, js_task, imgs_task));

exports.build = build;
exports.default = series(build, serve_task, watch_task);
