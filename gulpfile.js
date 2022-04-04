const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	js: './src/js/**/*.js',
	img: './src/img/*',
	dist: './dist',
	sassDest: './src/css',
	jsDest: './dist/js',
	imgDest: './dist/img',
};

function sassCompiler(done) {
	src(paths.sass) // szukamy sassa w folderze PATHS.SASS wszystkich .sass
		.pipe(sourcemaps.init()) // sourcemaps
		.pipe(sass().on('error', sass.logError)) // odpalamy sassa / ew. error
		.pipe(autoprefixer()) // odpalamy autoprefixer
		.pipe(cssnano()) // odpalamy cssnano
		.pipe(rename({ suffix: '.min' })) // rename z naszego style.css do style.min.css (dodajemy suffix)
		.pipe(sourcemaps.write()) // dodajemy sourcemape
		.pipe(dest(paths.sassDest)); // eksportujemy wszystko do destynacji ======ZE ZMIENNEJ PATHS.SASSDEST
	done();
}

function javaScript(done) {
	src(paths.js) // szukamy JS w folderze JS i wszystkich podfolderach ///// zmienna paths.JS
		.pipe(sourcemaps.init())
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write()) // dodajemy sourcemape
		.pipe(dest(paths.jsDest)); // eksportujemy wszystko do destynacji /JS
	done();
}

function convertImages(done) {
	src(paths.img) // szukamy wszystkich zdjęć w folderze IMG
		.pipe(imagemin())
		.pipe(dest(paths.imgDest)); // eksportujemy wszystko do destynacji IMG
	done();
}

function handleKits(done) {
	src(paths.html).pipe(kit()).pipe(dest('./'));
	done();
}

function cleanStuff(done) {
	src(paths.dist, { read: false }).pipe(clean()); // szukanie w discie rzeczy do czyszczenia
	done();
}

function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	});

	done();
}

function watchForChanges(done) {
	watch('./*.html').on('change', reload); // obserwacja zmian HTML + reload
	watch(
		[paths.html, paths.sass, paths.js],
		parallel(handleKits, sassCompiler, javaScript)
	).on('change', reload);
	watch(paths.img, convertImages).on('change', reload);
	done();
}

const mainFunctions = parallel(
	handleKits,
	sassCompiler,
	javaScript,
	convertImages
);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
