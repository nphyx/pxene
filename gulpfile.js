"use strict";
const gulp = require("gulp");
const babel = require("gulp-babel");
const babelRegister = require("babel-core/register");
const exec = require("child_process").exec;
const mocha = require("gulp-mocha");
const istanbul = require("gulp-babel-istanbul");
//const path = require("path");
//const webpack = require("webpack");
//const del = require("del");

gulp.task("babel", ["clean"], function() {
	return gulp.src(["src/*js"])
	.pipe(babel())
	.pipe(gulp.dest("dist/node"));
});

gulp.task("doc", function(cb) {
	exec("jsdox --templateDir docs/templates --output docs src/*.js", function(err, stdout, stderr) {
		console.log(stderr);
		console.log(stdout);
		cb(err);
	});
});

gulp.task("test", function() {
	return gulp.src(["test/*.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister
		}
	}));
});

gulp.task("test:coverage", function(cb) {
	gulp.src(["src/*js"])
	.pipe(istanbul())
	.pipe(istanbul.hookRequire())
	.on("finish", function() {
		gulp.src(["test/*.js"])
		.pipe(mocha({
			compilers: {
				bail:true,
				js:babelRegister
			}
		}))
		.pipe(istanbul.writeReports())
		.on("end", cb)
	});
});
