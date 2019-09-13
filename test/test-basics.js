/*global describe, it*/
"use strict";

require("should");
require("mocha");

module.exports = function(cdnizer, processInput) {
	describe("cdnizer: basic input", function() {

		it("should not modify a file if no matches", function() {
			processInput(['/no/match'], 'index.html', 'index-none.html');
		});

		it("should modify on basic input", function() {
			processInput({
				files: ['css/main.css', 'js/**/*.js'],
				defaultCDNBase: '//examplecdn/'
			}, 'index.html', 'index-generic.html');
		});

		it("should handle varied input", function() {
			processInput({
				files: ['css/*.css', 'js/**/*.js'],
				defaultCDNBase: '//examplecdn'
			}, 'index.html', 'index-generic.html');
		});

		it("should handle existing min and fallbacks", function() {
			processInput({
				files: [
					{
						file: 'js/**/angular/angular.js',
						test: "window['angular']"
					}
				],
				defaultCDNBase: '//examplecdn'
			}, 'index.html', 'index-fallback.html');
		});

		it("should add min with filenameMin", function() {
			processInput({
				files: [
					{
						file: 'js/**/firebase/firebase.js',
						cdn: '//examplecdn/js/vendor/firebase/${ filenameMin }'
					}
				]
			}, 'index.html', 'index-filename-min.html');
		});

		it("should handle revisioning", function() {
			processInput({
				allowRev: true,
				files: ['css/main.css', 'js/**/*.js'],
				defaultCDNBase: '//examplecdn/'
			}, 'index-revisions.html', 'index-revisions.html');
		});

		it("should use custom matchers with an object", function() {
			processInput({
				files: ['img/**/*.jpg'],
				defaultCDNBase: '//examplecdn',
				matchers: [
					{ pattern: /(<img\s.*?data-src=["'])(.+?)(["'].*?>)/gi, fallback: false }
				]
			}, 'index.html', 'index-data-src.html');
		});

		it("should use custom matchers with just a regular expression", function() {
			processInput({
				files: ['img/**/*.jpg'],
				defaultCDNBase: '//examplecdn',
				matchers: [/(<img\s.*?data-src=["'])(.+?)(["'].*?>)/gi]
			}, 'index.html', 'index-data-src.html');
		});

		it("should handle HTML without quoted attributes", function() {
			processInput({
				files: ['img/**/*.jpg', 'css/**/*.css', 'js/**/*.js'],
				defaultCDNBase: '//examplecdn'
			}, 'index.min.html', 'index-without-quotes.html')
		});

		it("should correctly handle other attributes within tags", function() {
			// NOTE: matchers are purposefully over-eager in their pattern matching,
			// to encourage re-processing of the same tag if it matches more than once!
			processInput({
				files: ['**/*.jpg', '**/*.css', '**/*.js'],
				defaultCDNBase: '//examplecdn'
			}, 'index-attribs.html', 'index-attribs.html')
		});

		it("should handle line-wrapped elements", function() {
			processInput({
				files: ['css/main.css', 'js/**/*.js', 'img/**'],
				defaultCDNBase: '//examplecdn/'
			}, 'index-multiline.html', 'index-multiline-generic.html');
		});

		it("should handle relative paths", function() {
			processInput({
				relativeRoot: 'src/',
				files: ['google:angular', '**/main.css', '**/*.js', '**/*.jpg'],
				defaultCDNBase: '//examplecdn/'
			}, 'index-relative.html', 'index-relative-generic.html');
		});

		it("should handle underscore templates", function() {
			processInput({
				files: ['css/main.css', 'js/**/*.js', 'img/**'],
				defaultCDNBase: '//examplecdn/'
			}, 'index-underscore-template.html', 'index-underscore-template.html');
		});

		it("should be unaffected by inline javascript", function() {
			processInput({
				files: ['css/main.css', 'js/**/*.js'],
				defaultCDNBase: '//examplecdn/'
			}, 'inline-javascript.html', 'inline-javascript.html');
		});

		it("should handle inline javascript", function() {
			var cdnBase = '//cdnhost/libs/min';
			processInput({
				files: [
					{
						file: 'libs/jquery.js',
						cdn: cdnBase + '/jquery.js'
					},
					{
						file: 'libs/underscore.js',
						cdn: cdnBase + '/underscore.js'
					}]
			}, 'index-inline-js.html', 'index-inline-js.html');
		});

		it("should handle excludeAbsolute config flag to ignore absolute URLs", function() {
			processInput({
				files: ['**/*.js', '**/*.png', '**/*.css'],
				defaultCDNBase: '//examplecdn/',
				excludeAbsolute: true,
			}, 'index-exclusions.html', 'index-exclusions.html');
		});
	});
};
